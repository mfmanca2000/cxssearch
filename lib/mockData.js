/**
 * Mock Active Directory data for demo / development (MOCK_MODE=true).
 * Simulates ACME Corp with ~1000 employees across multiple OUs.
 */

const BASE = 'DC=acme,DC=com'

// ─── OU tree ──────────────────────────────────────────────────────────────────

const mockTreeAcme = {
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

const coreUsers = [
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

// ─── Bulk-generated users (load-test data) ────────────────────────────────────

const FIRST_NAMES = ['Aaron','Adam','Aiden','Alan','Albert','Alex','Alice','Alicia','Alison','Amanda','Amy','Andre','Andrea','Andrew','Angela','Anna','Anthony','Antonio','Aria','Arjun','Arthur','Ashley','Austin','Ava','Ayesha','Beatriz','Benjamin','Beth','Blake','Boris','Brandon','Brianna','Bruno','Caleb','Camille','Carlos','Caroline','Cathy','Charlotte','Chris','Christina','Christopher','Claire','Claudia','Cole','Colin','Connor','Crystal','Dana','Daniel','Darren','David','Dean','Deepa','Diana','Dmitri','Dominic','Dylan','Eduardo','Elena','Elijah','Elizabeth','Ella','Eric','Erika','Evan','Faith','Fiona','Frank','Gabriel','Genevieve','George','Grace','Grant','Hayden','Helen','Henry','Hugo','Ian','Ibrahim','Iris','Jack','Jackson','Jacob','Jamie','Jason','Jennifer','Jeremy','Jessica','Joel','John','Jonathan','Jordan','Jose','Joseph','Joshua','Julia','Julian','Kate','Katherine','Kevin','Kyle','Laura','Lauren','Leah','Leo','Leon','Liam','Linda','Lisa','Logan','Luca','Lucy','Luis','Luke','Luna','Maria','Mark','Martin','Matthew','Maya','Michelle','Miguel','Mila','Mohamed','Monica','Morgan','Nadia','Nathan','Nicholas','Nicole','Nina','Nora','Oliver','Olivia','Omar','Oscar','Owen','Pablo','Patrick','Paul','Pedro','Peter','Philip','Rachel','Rebecca','Ricardo','Richard','Riley','Rosa','Samantha','Sandra','Sara','Scott','Sean','Sebastian','Serena','Simon','Sophia','Stefan','Stephanie','Steven','Susan','Thomas','Tim','Tyler','Uma','Victor','Vincent','Violet','William','Xin','Yasmin','Zach']

const LAST_NAMES = ['Adams','Ahmed','Al-Amin','Ali','Allen','Anderson','Baker','Bell','Black','Blake','Brooks','Brown','Burke','Campbell','Clark','Collins','Cruz','Davis','Edwards','Evans','Fischer','Fisher','Foster','Garcia','Gonzalez','Graham','Green','Greene','Gupta','Hall','Harris','Hernandez','Hill','Ibrahim','Jackson','Johnson','Jones','King','Lee','Lewis','Lopez','Martin','Martinez','Miller','Mitchell','Moore','Morrison','Nelson','Nguyen','Okafor','Osei','Perez','Phillips','Ramirez','Roberts','Robinson','Rodriguez','Ross','Scott','Shah','Singh','Smith','Stewart','Sullivan','Taylor','Thomas','Thompson','Torres','Turner','Vargas','Walker','Wang','White','Williams','Wilson','Wright','Young','Zhang']

const LOCATIONS = [
  { city: 'Zurich',           country: 'CH' },
  { city: 'Geneva',           country: 'CH' },
  { city: 'Basel',            country: 'CH' },
  { city: 'Bern',             country: 'CH' },
  { city: 'Lausanne',         country: 'CH' },
  { city: 'Lugano',           country: 'CH' },
  { city: 'Winterthur',       country: 'CH' },
  { city: 'St. Gallen',       country: 'CH' },
  { city: 'Lucerne',          country: 'CH' },
  { city: 'Biel',             country: 'CH' },
  { city: 'Thun',             country: 'CH' },
  { city: 'Zug',              country: 'CH' },
  { city: 'Fribourg',         country: 'CH' },
  { city: 'Schaffhausen',     country: 'CH' },
  { city: 'Chur',             country: 'CH' },
  { city: 'Neuchâtel',        country: 'CH' },
  { city: 'Sion',             country: 'CH' },
  { city: 'Aarau',            country: 'CH' },
  { city: 'Baden',            country: 'CH' },
  { city: 'Solothurn',        country: 'CH' },
  { city: 'Frauenfeld',       country: 'CH' },
  { city: 'Bellinzona',       country: 'CH' },
  { city: 'Herisau',          country: 'CH' },
  { city: 'Glarus',           country: 'CH' },
  { city: 'Altdorf',          country: 'CH' },
  { city: 'Sarnen',           country: 'CH' },
  { city: 'Stans',            country: 'CH' },
  { city: 'Appenzell',        country: 'CH' },
  { city: 'Liestal',          country: 'CH' },
  { city: 'Delémont',         country: 'CH' },
]

const OU_POOL = [
  { ou: FE,   department: 'Engineering',     titles: ['Frontend Engineer','Senior Frontend Engineer','UI Engineer','React Developer'] },
  { ou: BE,   department: 'Engineering',     titles: ['Backend Engineer','Senior Backend Engineer','API Engineer','Platform Engineer'] },
  { ou: OPS,  department: 'Engineering',     titles: ['DevOps Engineer','Site Reliability Engineer','Cloud Engineer','Infrastructure Engineer'] },
  { ou: QA,   department: 'Engineering',     titles: ['QA Engineer','Test Engineer','Automation Engineer','SDET'] },
  { ou: DIG,  department: 'Marketing',       titles: ['Digital Marketing Manager','SEO Analyst','PPC Specialist','Analytics Manager'] },
  { ou: BRD,  department: 'Marketing',       titles: ['Brand Manager','Content Writer','Graphic Designer','Social Media Manager'] },
  { ou: AMR,  department: 'Sales',           titles: ['Account Executive','Sales Development Rep','Enterprise Account Exec','Regional Manager'] },
  { ou: EMEA, department: 'Sales',           titles: ['Account Executive','Sales Development Rep','Business Development Rep','Regional Manager'] },
  { ou: APAC, department: 'Sales',           titles: ['Account Executive','Sales Development Rep','Business Development Rep','Regional Manager'] },
  { ou: HR,   department: 'Human Resources', titles: ['HR Business Partner','Recruiter','HR Coordinator','People Operations Specialist'] },
  { ou: FIN,  department: 'Finance',         titles: ['Financial Analyst','Accountant','Controller','FP&A Analyst'] },
  { ou: LEG,  department: 'Legal',           titles: ['Legal Counsel','Paralegal','Compliance Analyst','Contract Manager'] },
]

function generateBulkUsers(count, startId) {
  const users = []
  for (let i = 0; i < count; i++) {
    const id       = startId + i
    const first    = FIRST_NAMES[(id * 7)  % FIRST_NAMES.length]
    const last     = LAST_NAMES[ (id * 13 + 5) % LAST_NAMES.length]
    const name     = `${first} ${last}`
    const { ou, department, titles } = OU_POOL[(id * 5) % OU_POOL.length]
    const { city, country }          = LOCATIONS[(id * 3 + 2) % LOCATIONS.length]
    const title    = titles[(id * 11) % titles.length]
    users.push(user({ id, name, ou, title, department, city, country }))
  }
  return users
}

const _acmeUsers = [...coreUsers, ...generateBulkUsers(1000, 49)]

export const mockTree   = mockTreeAcme
export const mockUsers  = _acmeUsers
export const mockSkills = null

export function findMockUserByCredentials(username, mail) {
  if (username) {
    const unameLower = username.toLowerCase()
    const byUsername = _acmeUsers.find(
      (u) => (u.sAMAccountName ?? '').toLowerCase() === unameLower
    )
    if (byUsername) return byUsername
  }

  if (mail) {
    const mailLower = mail.toLowerCase()
    return _acmeUsers.find((u) => (u.mail ?? '').toLowerCase() === mailLower) ?? null
  }

  return null
}
