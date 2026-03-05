/**
 * CSX Search – Express backend
 * Connects to Active Directory via LDAP (or uses built-in mock data).
 *
 * ENV variables (see .env.example):
 *   LDAP_URL, LDAP_BIND_DN, LDAP_BIND_PASSWORD, LDAP_BASE_DN,
 *   PORT, CACHE_TTL, MOCK_MODE
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import ldap from 'ldapjs'
import NodeCache from 'node-cache'
import { mockTree, mockUsers } from './src/mock/data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

const PORT       = Number(process.env.PORT ?? 3001)
const MOCK_MODE  = process.env.MOCK_MODE === 'true'
const CACHE_TTL  = Number(process.env.CACHE_TTL ?? 300)
const BASE_DN    = process.env.LDAP_BASE_DN ?? ''

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 })

// ─────────────────────────────────────────────────────────────────────────────
// LDAP helpers
// ─────────────────────────────────────────────────────────────────────────────

function createClient() {
  return ldap.createClient({
    url:            process.env.LDAP_URL,
    connectTimeout: 5000,
    timeout:        10000,
    tlsOptions:     { rejectUnauthorized: false }, // adjust for your PKI
  })
}

/**
 * Perform a paged LDAP search and return all entries as plain objects.
 */
function ldapSearch(baseDN, filter, attributes) {
  return new Promise((resolve, reject) => {
    const client = createClient()

    client.on('error', (err) => {
      client.destroy()
      reject(err)
    })

    client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (bindErr) => {
      if (bindErr) { client.destroy(); return reject(bindErr) }

      const opts = {
        filter,
        scope: 'sub',
        attributes,
        paged: { pageSize: 500 },
        timeLimit: 30,
      }

      const results = []

      client.search(baseDN, opts, (searchErr, res) => {
        if (searchErr) { client.destroy(); return reject(searchErr) }

        res.on('searchEntry', (entry) => {
          // ldapjs 3.x uses entry.pojo; fall back to entry.object for older versions
          const raw = entry.pojo ?? entry.object
          if (raw) results.push(raw)
        })

        res.on('error', (err) => { client.destroy(); reject(err) })

        res.on('end', () => {
          client.unbind(() => client.destroy())
          resolve(results)
        })
      })
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree builder – converts flat OU list → nested tree
// ─────────────────────────────────────────────────────────────────────────────

function parseName(dn) {
  const first = dn.split(',')[0] ?? ''
  return first.replace(/^(OU|CN|DC)=/i, '').trim()
}

function buildOuTree(ous, baseDN) {
  const map = {}
  const root = { dn: baseDN, name: parseName(baseDN), children: [] }
  map[baseDN.toLowerCase()] = root

  // Sort by depth (fewer commas = higher level) so parents are created first
  const sorted = [...ous].sort((a, b) => {
    const depA = (a.dn ?? '').split(',').length
    const depB = (b.dn ?? '').split(',').length
    return depA - depB
  })

  for (const ou of sorted) {
    const dn = ou.dn ?? ou.distinguishedName ?? ''
    if (!dn) continue
    const name = ou.ou ?? ou.cn ?? parseName(dn)
    const node = { dn, name, children: [] }
    map[dn.toLowerCase()] = node

    const parentDN = dn.slice(dn.indexOf(',') + 1)
    const parent = map[parentDN.toLowerCase()] ?? root
    parent.children.push(node)
  }

  return root
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalise a raw LDAP/mock user object to a consistent shape
// ─────────────────────────────────────────────────────────────────────────────

function firstVal(v) {
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

function normaliseUser(raw) {
  const photo = firstVal(raw.thumbnailPhoto)
  return {
    dn:          firstVal(raw.dn ?? raw.distinguishedName),
    cn:          firstVal(raw.cn) ?? '',
    username:    firstVal(raw.sAMAccountName) ?? '',
    mail:        firstVal(raw.mail) ?? '',
    title:       firstVal(raw.title) ?? '',
    department:  firstVal(raw.department) ?? '',
    phone:       firstVal(raw.telephoneNumber) ?? firstVal(raw.ipPhone) ?? '',
    mobile:      firstVal(raw.mobile) ?? firstVal(raw.mobileTelephoneNumber) ?? '',
    office:      firstVal(raw.physicalDeliveryOfficeName) ?? '',
    city:        firstVal(raw.l) ?? '',
    country:     firstVal(raw.c) ?? firstVal(raw.co) ?? '',
    company:     firstVal(raw.company) ?? '',
    manager:     firstVal(raw.manager) ?? '',
    // Only include thumbnail if it's a string (base64); binary blobs are skipped
    photo:       typeof photo === 'string' && photo.length < 200000 ? photo : null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/tree
 * Returns the full OU hierarchy as a nested JSON tree.
 */
app.get('/api/tree', async (_req, res) => {
  const cacheKey = 'tree'
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)

  if (MOCK_MODE) {
    cache.set(cacheKey, mockTree)
    return res.json(mockTree)
  }

  try {
    const ous = await ldapSearch(
      BASE_DN,
      '(objectClass=organizationalUnit)',
      ['distinguishedName', 'ou', 'cn', 'description'],
    )
    const tree = buildOuTree(ous, BASE_DN)
    cache.set(cacheKey, tree)
    res.json(tree)
  } catch (err) {
    console.error('[tree]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/users?base=DN
 * Returns all active users within the given subtree.
 * Results are cached per base DN.
 */
app.get('/api/users', async (req, res) => {
  const base = (req.query.base ?? BASE_DN).toString().trim()
  if (!base) return res.status(400).json({ error: 'base DN is required' })

  const cacheKey = `users:${base.toLowerCase()}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)

  if (MOCK_MODE) {
    const baseLower = base.toLowerCase()
    // An entry is "within" a base DN when its DN ends with ',' + base (subtree child)
    // or equals the base exactly (direct match).
    const users = mockUsers
      .filter((u) => {
        const dn = u.dn.toLowerCase()
        return dn === baseLower || dn.endsWith(',' + baseLower)
      })
      .map(normaliseUser)
    cache.set(cacheKey, users)
    return res.json(users)
  }

  try {
    // Fetch active (non-disabled) user accounts
    const filter =
      '(&(objectCategory=person)(objectClass=user)' +
      '(!(userAccountControl:1.2.840.113556.1.4.803:=2)))'

    const attrs = [
      'distinguishedName', 'cn', 'sAMAccountName',
      'mail', 'title', 'department',
      'telephoneNumber', 'ipPhone', 'mobile',
      'physicalDeliveryOfficeName', 'l', 'c', 'co', 'company',
      'manager', 'thumbnailPhoto',
    ]

    const raw = await ldapSearch(base, filter, attrs)
    const users = raw.map(normaliseUser)
    cache.set(cacheKey, users)
    res.json(users)
  } catch (err) {
    console.error('[users]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/config
 * Returns non-sensitive runtime config (base DN, mock mode flag).
 */
app.get('/api/config', (_req, res) => {
  res.json({
    baseDN:   BASE_DN || 'DC=company,DC=com',
    mockMode: MOCK_MODE,
    cacheTTL: CACHE_TTL,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Serve React build in production
// ─────────────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`\n  🔍  CSX Search API  →  http://localhost:${PORT}`)
  console.log(`  ${MOCK_MODE ? '🎭  Mock mode  (no AD needed)' : '🏢  LDAP mode  →  ' + process.env.LDAP_URL}\n`)
})
