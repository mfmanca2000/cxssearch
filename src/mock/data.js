/**
 * Mock Active Directory data for demo / development.
 * Simulates ACME Corp with ~60 employees across multiple OUs.
 */

const BASE = 'DC=acme,DC=com'

// ─── OU tree ──────────────────────────────────────────────────────────────────

export const mockTree = {
  dn: BASE,
  name: 'acme.com',
  children: [
    {
      dn: `OU=ACME,${BASE}`,
      name: 'ACME',
      children: [
        {
          dn: `OU=Engineering,OU=ACME,${BASE}`,
          name: 'Engineering',
          children: [
            { dn: `OU=Frontend,OU=Engineering,OU=ACME,${BASE}`, name: 'Frontend', children: [] },
            { dn: `OU=Backend,OU=Engineering,OU=ACME,${BASE}`,  name: 'Backend',  children: [] },
            { dn: `OU=DevOps,OU=Engineering,OU=ACME,${BASE}`,   name: 'DevOps',   children: [] },
            { dn: `OU=QA,OU=Engineering,OU=ACME,${BASE}`,       name: 'QA',       children: [] },
          ],
        },
        {
          dn: `OU=Marketing,OU=ACME,${BASE}`,
          name: 'Marketing',
          children: [
            { dn: `OU=Digital,OU=Marketing,OU=ACME,${BASE}`, name: 'Digital',       children: [] },
            { dn: `OU=Brand,OU=Marketing,OU=ACME,${BASE}`,   name: 'Brand & Comms', children: [] },
          ],
        },
        {
          dn: `OU=Sales,OU=ACME,${BASE}`,
          name: 'Sales',
          children: [
            { dn: `OU=Americas,OU=Sales,OU=ACME,${BASE}`, name: 'Americas', children: [] },
            { dn: `OU=EMEA,OU=Sales,OU=ACME,${BASE}`,     name: 'EMEA',     children: [] },
            { dn: `OU=APAC,OU=Sales,OU=ACME,${BASE}`,     name: 'APAC',     children: [] },
          ],
        },
        { dn: `OU=HR,OU=ACME,${BASE}`,      name: 'Human Resources', children: [] },
        { dn: `OU=Finance,OU=ACME,${BASE}`, name: 'Finance',         children: [] },
        { dn: `OU=Legal,OU=ACME,${BASE}`,   name: 'Legal',           children: [] },
      ],
    },
  ],
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function user({ id, name, ou, title, department, phone, city, country, company = 'ACME Corp' }) {
  const [first, ...rest] = name.split(' ')
  const last   = rest.join('')
  const uname  = `${first.toLowerCase()}.${last.toLowerCase()}`
  return {
    dn:          `CN=${name},${ou},${BASE}`,
    cn:          name,
    sAMAccountName: uname,
    mail:        `${uname}@acme.com`,
    title,
    department,
    telephoneNumber: phone ?? `+1 555 ${String(id).padStart(4, '0')}`,
    mobile:      `+1 555 9${String(id).padStart(3, '0')}`,
    physicalDeliveryOfficeName: city === 'New York' ? 'HQ – 5th Ave' : city === 'London' ? 'EMEA HQ' : city,
    l:           city,
    c:           country,
    company,
    manager:     '',
    thumbnailPhoto: null,
  }
}

// ─── Employees ────────────────────────────────────────────────────────────────

const ENG  = `OU=Engineering,OU=ACME`
const FE   = `OU=Frontend,OU=Engineering,OU=ACME`
const BE   = `OU=Backend,OU=Engineering,OU=ACME`
const OPS  = `OU=DevOps,OU=Engineering,OU=ACME`
const QA   = `OU=QA,OU=Engineering,OU=ACME`
const MKT  = `OU=Marketing,OU=ACME`
const DIG  = `OU=Digital,OU=Marketing,OU=ACME`
const BRD  = `OU=Brand,OU=Marketing,OU=ACME`
const SAL  = `OU=Sales,OU=ACME`
const AMR  = `OU=Americas,OU=Sales,OU=ACME`
const EMEA = `OU=EMEA,OU=Sales,OU=ACME`
const APAC = `OU=APAC,OU=Sales,OU=ACME`
const HR   = `OU=HR,OU=ACME`
const FIN  = `OU=Finance,OU=ACME`
const LEG  = `OU=Legal,OU=ACME`

export const mockUsers = [
  // ── Engineering leadership ──
  user({ id:1,  name:'Alexandra Chen',    ou:ENG,  title:'VP of Engineering',         department:'Engineering',    city:'New York',    country:'US' }),
  // ── Frontend ──
  user({ id:2,  name:'Lucas Hoffmann',    ou:FE,   title:'Frontend Lead',             department:'Engineering',    city:'Berlin',      country:'DE' }),
  user({ id:3,  name:'Sofia Romero',      ou:FE,   title:'Senior Frontend Engineer',  department:'Engineering',    city:'Madrid',      country:'ES' }),
  user({ id:4,  name:'James Whitfield',   ou:FE,   title:'Frontend Engineer',         department:'Engineering',    city:'New York',    country:'US' }),
  user({ id:5,  name:'Yuki Tanaka',       ou:FE,   title:'Frontend Engineer',         department:'Engineering',    city:'Tokyo',       country:'JP' }),
  user({ id:6,  name:'Priya Nair',        ou:FE,   title:'UI/UX Engineer',            department:'Engineering',    city:'Bangalore',   country:'IN' }),
  // ── Backend ──
  user({ id:7,  name:'Marco Bianchi',     ou:BE,   title:'Backend Lead',              department:'Engineering',    city:'Milan',       country:'IT' }),
  user({ id:8,  name:'Emily Carter',      ou:BE,   title:'Senior Backend Engineer',   department:'Engineering',    city:'London',      country:'GB' }),
  user({ id:9,  name:'Diego Morales',     ou:BE,   title:'Backend Engineer',          department:'Engineering',    city:'Bogotá',      country:'CO' }),
  user({ id:10, name:'Anika Patel',       ou:BE,   title:'Backend Engineer',          department:'Engineering',    city:'New York',    country:'US' }),
  user({ id:11, name:'Finn Larsson',      ou:BE,   title:'Database Engineer',         department:'Engineering',    city:'Stockholm',   country:'SE' }),
  // ── DevOps ──
  user({ id:12, name:'Ryan Osei',         ou:OPS,  title:'DevOps Lead',               department:'Engineering',    city:'Accra',       country:'GH' }),
  user({ id:13, name:'Hannah Müller',     ou:OPS,  title:'Site Reliability Engineer', department:'Engineering',    city:'Munich',      country:'DE' }),
  user({ id:14, name:'Tom Nakamura',      ou:OPS,  title:'Platform Engineer',         department:'Engineering',    city:'San Francisco',country:'US' }),
  // ── QA ──
  user({ id:15, name:'Isabelle Dubois',   ou:QA,   title:'QA Lead',                   department:'Engineering',    city:'Paris',       country:'FR' }),
  user({ id:16, name:'Chen Wei',          ou:QA,   title:'QA Engineer',               department:'Engineering',    city:'Shanghai',    country:'CN' }),
  user({ id:17, name:'Marcus Bell',       ou:QA,   title:'Automation Engineer',       department:'Engineering',    city:'Austin',      country:'US' }),
  // ── Marketing ──
  user({ id:18, name:'Valentina Costa',   ou:MKT,  title:'Chief Marketing Officer',   department:'Marketing',      city:'New York',    country:'US' }),
  // ── Digital ──
  user({ id:19, name:'Noah Fisher',       ou:DIG,  title:'Digital Marketing Lead',    department:'Marketing',      city:'London',      country:'GB' }),
  user({ id:20, name:'Amara Okafor',      ou:DIG,  title:'SEO Specialist',            department:'Marketing',      city:'Lagos',       country:'NG' }),
  user({ id:21, name:'Jake Morrison',     ou:DIG,  title:'Growth Hacker',             department:'Marketing',      city:'New York',    country:'US' }),
  user({ id:22, name:'Mei Lin',           ou:DIG,  title:'Content Strategist',        department:'Marketing',      city:'Singapore',   country:'SG' }),
  // ── Brand ──
  user({ id:23, name:'Clara Fontaine',    ou:BRD,  title:'Brand Director',            department:'Marketing',      city:'Paris',       country:'FR' }),
  user({ id:24, name:'Oliver Graham',     ou:BRD,  title:'Copywriter',                department:'Marketing',      city:'London',      country:'GB' }),
  user({ id:25, name:'Sara Johansson',    ou:BRD,  title:'Graphic Designer',          department:'Marketing',      city:'Gothenburg',  country:'SE' }),
  // ── Sales ──
  user({ id:26, name:'Charles Denton',    ou:SAL,  title:'Chief Revenue Officer',     department:'Sales',          city:'New York',    country:'US' }),
  // ── Americas ──
  user({ id:27, name:'Isabella Rivera',   ou:AMR,  title:'Americas Sales Director',   department:'Sales',          city:'Miami',       country:'US' }),
  user({ id:28, name:'Hunter Collins',    ou:AMR,  title:'Enterprise Account Exec',   department:'Sales',          city:'Chicago',     country:'US' }),
  user({ id:29, name:'Camila Santos',     ou:AMR,  title:'Account Executive',         department:'Sales',          city:'São Paulo',   country:'BR' }),
  user({ id:30, name:'Ethan Brooks',      ou:AMR,  title:'Sales Development Rep',     department:'Sales',          city:'Toronto',     country:'CA' }),
  // ── EMEA ──
  user({ id:31, name:'Fatima Al-Rashidi', ou:EMEA, title:'EMEA Sales Director',       department:'Sales',          city:'Dubai',       country:'AE' }),
  user({ id:32, name:'Pierre Lefebvre',   ou:EMEA, title:'Enterprise Account Exec',   department:'Sales',          city:'Paris',       country:'FR' }),
  user({ id:33, name:'Adebayo Afolabi',   ou:EMEA, title:'Account Executive',         department:'Sales',          city:'Lagos',       country:'NG' }),
  user({ id:34, name:'Sophie Wagner',     ou:EMEA, title:'Business Development Rep',  department:'Sales',          city:'Frankfurt',   country:'DE' }),
  // ── APAC ──
  user({ id:35, name:'Kenji Watanabe',    ou:APAC, title:'APAC Sales Director',       department:'Sales',          city:'Tokyo',       country:'JP' }),
  user({ id:36, name:'Aarav Mehta',       ou:APAC, title:'Account Executive',         department:'Sales',          city:'Mumbai',      country:'IN' }),
  user({ id:37, name:'Li Wei',            ou:APAC, title:'Sales Development Rep',     department:'Sales',          city:'Beijing',     country:'CN' }),
  // ── HR ──
  user({ id:38, name:'Patricia Wells',    ou:HR,   title:'VP of People & Culture',    department:'Human Resources',city:'New York',    country:'US' }),
  user({ id:39, name:'Daniela Ferreira',  ou:HR,   title:'HR Business Partner',       department:'Human Resources',city:'Lisbon',      country:'PT' }),
  user({ id:40, name:'Michael Chang',     ou:HR,   title:'Talent Acquisition Lead',   department:'Human Resources',city:'San Francisco',country:'US' }),
  user({ id:41, name:'Amelia Thornton',   ou:HR,   title:'L&D Specialist',            department:'Human Resources',city:'London',      country:'GB' }),
  // ── Finance ──
  user({ id:42, name:'Robert Kaufmann',   ou:FIN,  title:'Chief Financial Officer',   department:'Finance',        city:'Zurich',      country:'CH' }),
  user({ id:43, name:'Nadia Petrov',      ou:FIN,  title:'Financial Controller',      department:'Finance',        city:'Amsterdam',   country:'NL' }),
  user({ id:44, name:'Samuel Greene',     ou:FIN,  title:'Senior Accountant',         department:'Finance',        city:'New York',    country:'US' }),
  user({ id:45, name:'Zoe Kim',           ou:FIN,  title:'Financial Analyst',         department:'Finance',        city:'Seoul',       country:'KR' }),
  // ── Legal ──
  user({ id:46, name:'Victoria Lawson',   ou:LEG,  title:'General Counsel',           department:'Legal',          city:'New York',    country:'US' }),
  user({ id:47, name:'Hassan Al-Amin',    ou:LEG,  title:'Senior Legal Counsel',      department:'Legal',          city:'Dubai',       country:'AE' }),
  user({ id:48, name:'Catherine Bouchard',ou:LEG,  title:'Compliance Officer',        department:'Legal',          city:'Montreal',    country:'CA' }),
]
