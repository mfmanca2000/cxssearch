/**
 * Singleton in-process store for user skills in mock mode.
 * Shared by the profile/skills and qa/experts route handlers.
 * Data resets on server restart — acceptable for dev/mock.
 */

const g = globalThis as unknown as {
  _mockSkills: Map<string, Set<string>> | undefined
  _mockSkillsSeeded: boolean | undefined
}

export const mockSkillsStore: Map<string, Set<string>> =
  g._mockSkills ?? (g._mockSkills = new Map())

// ─── Skill pools by department ────────────────────────────────────────────────

const SKILL_POOLS: Record<string, string[]> = {
  Frontend: [
    'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript',
    'GraphQL', 'Figma', 'Jest', 'Storybook', 'CSS', 'Webpack', 'Vite',
    'Accessibility (a11y)', 'Performance Optimization', 'Vue.js', 'Redux',
    'React Query', 'Web Animations', 'Playwright',
  ],
  Backend: [
    'Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis', 'REST APIs',
    'GraphQL', 'Docker', 'Microservices', 'gRPC', 'Kafka', 'MongoDB',
    'TypeScript', 'FastAPI', 'Express.js', 'ElasticSearch', 'RabbitMQ',
    'SQLAlchemy', 'Prisma',
  ],
  DevOps: [
    'Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Azure',
    'CI/CD', 'GitHub Actions', 'Prometheus', 'Grafana', 'Linux',
    'Ansible', 'Helm', 'Datadog', 'ArgoCD', 'Bash Scripting',
    'CloudFormation', 'Vault (HashiCorp)', 'SLO/SLA Management',
  ],
  QA: [
    'Selenium', 'Playwright', 'Cypress', 'Jest', 'Pytest',
    'Test Automation', 'Performance Testing', 'Load Testing',
    'API Testing', 'BDD / Gherkin', 'TestRail', 'Postman',
    'K6', 'Accessibility Testing', 'Mobile Testing',
  ],
  Digital: [
    'SEO', 'Google Analytics', 'PPC / Google Ads', 'A/B Testing',
    'Content Marketing', 'Email Marketing', 'HubSpot', 'Data Analysis',
    'Looker Studio', 'Meta Ads', 'Conversion Rate Optimization',
    'Marketing Automation', 'LinkedIn Ads',
  ],
  Brand: [
    'Adobe Illustrator', 'Figma', 'Brand Strategy', 'Copywriting',
    'Social Media Management', 'Content Creation', 'Adobe Photoshop',
    'Video Editing', 'Canva', 'Storytelling', 'PR & Communications',
  ],
  Sales: [
    'Salesforce CRM', 'Account Management', 'Negotiation', 'Solution Selling',
    'Sales Forecasting', 'Tableau', 'HubSpot CRM', 'Cold Outreach',
    'Discovery Calls', 'Contract Negotiation', 'Competitive Analysis',
    'Pipeline Management', 'Executive Presentations',
  ],
  'Human Resources': [
    'HRIS (Workday)', 'Recruiting', 'Performance Management',
    'Learning & Development', 'Employment Law', 'Compensation & Benefits',
    'Onboarding', 'Employee Relations', 'Organizational Design',
    'HR Analytics', 'Culture Building',
  ],
  Finance: [
    'Financial Modeling', 'FP&A', 'Excel / Power Query', 'SQL',
    'Power BI', 'GAAP', 'IFRS', 'ERP (SAP)', 'NetSuite',
    'Budgeting & Forecasting', 'Variance Analysis', 'Investor Relations',
  ],
  Legal: [
    'Contract Negotiation', 'Compliance', 'Employment Law',
    'Intellectual Property', 'GDPR / Privacy Law', 'SaaS Agreements',
    'Corporate Governance', 'Litigation Management', 'Risk Management',
    'M&A Due Diligence',
  ],
  Engineering: [
    'System Design', 'Technical Roadmapping', 'Engineering Management',
    'OKRs', 'Agile / Scrum', 'Hiring & Interviews', 'Budget Planning',
  ],
  Marketing: [
    'Marketing Strategy', 'Go-to-Market', 'Campaign Planning',
    'Brand Building', 'Market Research', 'Budget Management',
  ],
}

// Deterministic pick: always same skills for same DN (stable across restarts)
function pickSkills(pool: string[], dn: string, min: number, max: number): string[] {
  const hash = [...dn].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const count = min + (hash % (max - min + 1))
  const shuffled = [...pool].sort((a, b) => {
    const ha = [...(dn + a)].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const hb = [...(dn + b)].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return ha - hb
  })
  return shuffled.slice(0, count)
}

function ouToPool(dn: string): string[] {
  if (dn.includes('OU=Frontend'))        return SKILL_POOLS.Frontend
  if (dn.includes('OU=Backend'))         return SKILL_POOLS.Backend
  if (dn.includes('OU=DevOps'))          return SKILL_POOLS.DevOps
  if (dn.includes('OU=QA'))              return SKILL_POOLS.QA
  if (dn.includes('OU=Digital'))         return SKILL_POOLS.Digital
  if (dn.includes('OU=Brand'))           return SKILL_POOLS.Brand
  if (dn.includes('OU=Americas') ||
      dn.includes('OU=EMEA') ||
      dn.includes('OU=Sales'))           return SKILL_POOLS.Sales
  if (dn.includes('OU=HR'))              return SKILL_POOLS['Human Resources']
  if (dn.includes('OU=Finance'))         return SKILL_POOLS.Finance
  if (dn.includes('OU=Legal'))           return SKILL_POOLS.Legal
  if (dn.includes('OU=Engineering'))     return SKILL_POOLS.Engineering
  if (dn.includes('OU=Marketing'))       return SKILL_POOLS.Marketing
  return []
}

/**
 * Pre-seed skills for all mock users. Called once; idempotent.
 * Pass the mockUsers array so this module doesn't import from mockData
 * (which would create a circular dependency).
 * Optionally pass preloadedSkills (Record<dn, string[]>) from neliData.json
 * to use real skills instead of generated ones.
 */
export function seedMockSkills(
  users: Array<{ dn: string }>,
  preloadedSkills: Record<string, string[]> | null = null,
): void {
  if (g._mockSkillsSeeded) return
  g._mockSkillsSeeded = true

  for (const u of users) {
    if (mockSkillsStore.has(u.dn)) continue
    if (preloadedSkills && preloadedSkills[u.dn]) {
      mockSkillsStore.set(u.dn, new Set(preloadedSkills[u.dn]))
      continue
    }
    const pool = ouToPool(u.dn)
    if (!pool.length) continue
    const skills = pickSkills(pool, u.dn, 3, 7)
    mockSkillsStore.set(u.dn, new Set(skills))
  }
}

export function getMockSkills(dn: string): string[] {
  return [...(mockSkillsStore.get(dn) ?? [])].sort()
}

export function addMockSkill(dn: string, skill: string): void {
  if (!mockSkillsStore.has(dn)) mockSkillsStore.set(dn, new Set())
  mockSkillsStore.get(dn)!.add(skill)
}

export function removeMockSkill(dn: string, skill: string): void {
  mockSkillsStore.get(dn)?.delete(skill)
}

/** Returns a flat Map<dn, string[]> of all stored skills — for the experts route. */
export function getAllMockSkills(): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const [dn, set] of mockSkillsStore) out.set(dn, [...set].sort())
  return out
}
