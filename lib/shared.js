/**
 * Shared logic used by both Vercel API functions (api/) and the local
 * Express dev server (server.js).
 */

import NodeCache from 'node-cache'
import { mockTree, mockUsers } from './mockData.js'

// ─── Config ───────────────────────────────────────────────────────────────────

export const CACHE_TTL = Number(process.env.CACHE_TTL ?? 300)
export const BASE_DN   = process.env.LDAP_BASE_DN ?? ''

/**
 * Mock mode is ON unless LDAP_URL is configured AND MOCK_MODE is explicitly
 * set to "false". Defaults to mock so Vercel deployments work out of the box.
 */
export const MOCK_MODE =
  process.env.MOCK_MODE === 'false' && !!process.env.LDAP_URL ? false : true

export const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 })

// ─── Utilities ────────────────────────────────────────────────────────────────

export function parseName(dn) {
  const first = dn.split(',')[0] ?? ''
  return first.replace(/^(OU|CN|DC)=/i, '').trim()
}

export function buildOuTree(ous, baseDN) {
  const map  = {}
  const root = { dn: baseDN, name: parseName(baseDN), children: [] }
  map[baseDN.toLowerCase()] = root

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
    const parent   = map[parentDN.toLowerCase()] ?? root
    parent.children.push(node)
  }

  return root
}

function firstVal(v) {
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

export function normaliseUser(raw) {
  const photo = firstVal(raw.thumbnailPhoto)
  return {
    dn:         firstVal(raw.dn ?? raw.distinguishedName),
    cn:         firstVal(raw.cn) ?? '',
    username:   firstVal(raw.sAMAccountName) ?? '',
    mail:       firstVal(raw.mail) ?? '',
    title:      firstVal(raw.title) ?? '',
    department: firstVal(raw.department) ?? '',
    phone:      firstVal(raw.telephoneNumber) ?? firstVal(raw.ipPhone) ?? '',
    mobile:     firstVal(raw.mobile) ?? firstVal(raw.mobileTelephoneNumber) ?? '',
    office:     firstVal(raw.physicalDeliveryOfficeName) ?? '',
    city:       firstVal(raw.l) ?? '',
    country:    firstVal(raw.c) ?? firstVal(raw.co) ?? '',
    company:    firstVal(raw.company) ?? '',
    manager:    firstVal(raw.manager) ?? '',
    photo:      typeof photo === 'string' && photo.length < 200000 ? photo : null,
  }
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

export function getMockTree() {
  return mockTree
}

export function getMockUsers(base) {
  const baseLower = base.toLowerCase()
  return mockUsers
    .filter((u) => {
      const dn = u.dn.toLowerCase()
      return dn === baseLower || dn.endsWith(',' + baseLower)
    })
    .map(normaliseUser)
}

// ─── LDAP search (lazy-loaded so it never runs in mock mode) ──────────────────

export async function ldapSearch(baseDN, filter, attributes) {
  const { default: ldap } = await import('ldapjs')

  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url:            process.env.LDAP_URL,
      connectTimeout: 5000,
      timeout:        10000,
      tlsOptions:     { rejectUnauthorized: false },
    })

    client.on('error', (err) => { client.destroy(); reject(err) })

    client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (bindErr) => {
      if (bindErr) { client.destroy(); return reject(bindErr) }

      const opts = { filter, scope: 'sub', attributes, paged: { pageSize: 500 }, timeLimit: 30 }
      const results = []

      client.search(baseDN, opts, (searchErr, res) => {
        if (searchErr) { client.destroy(); return reject(searchErr) }
        res.on('searchEntry', (entry) => {
          const raw = entry.pojo ?? entry.object
          if (raw) results.push(raw)
        })
        res.on('error',  (err) => { client.destroy(); reject(err) })
        res.on('end',    ()    => { client.unbind(() => client.destroy()); resolve(results) })
      })
    })
  })
}
