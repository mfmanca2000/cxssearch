/**
 * Professional skills taxonomy.
 *
 * Curated from multiple public sources:
 *  - ESCO (European Skills/Competences/Qualifications/Occupations) v1.1
 *  - O*NET Skills database (US Dept of Labor)
 *  - LinkedIn's most-endorsed skill categories (publicly documented)
 *
 * Organised into broad categories so the UI can show grouped suggestions.
 */

export interface SkillCategory {
  label: string
  skills: string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: 'Programming Languages',
    skills: [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'C++', 'C',
      'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'PHP', 'Scala', 'R',
      'MATLAB', 'Perl', 'Haskell', 'Elixir', 'Clojure', 'Lua', 'Dart',
      'Groovy', 'Julia', 'F#', 'VBA', 'Bash / Shell Scripting', 'PowerShell',
    ],
  },
  {
    label: 'Web & Frontend',
    skills: [
      'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'HTML5', 'CSS3',
      'Tailwind CSS', 'SASS/SCSS', 'Redux', 'Zustand', 'GraphQL',
      'REST APIs', 'WebSockets', 'Progressive Web Apps', 'Web Accessibility (WCAG)',
      'Webpack', 'Vite', 'Testing Library', 'Cypress', 'Playwright',
    ],
  },
  {
    label: 'Backend & APIs',
    skills: [
      'Node.js', 'Express.js', 'NestJS', 'Django', 'FastAPI', 'Flask',
      'Spring Boot', 'ASP.NET Core', 'Rails', 'Laravel', 'Phoenix',
      'gRPC', 'OpenAPI / Swagger', 'OAuth 2.0', 'JWT', 'Microservices',
      'Event-Driven Architecture', 'Message Queues', 'Apache Kafka', 'RabbitMQ',
    ],
  },
  {
    label: 'Databases',
    skills: [
      'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'SQLite', 'Oracle DB',
      'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
      'Neo4j', 'InfluxDB', 'Snowflake', 'BigQuery', 'dbt',
      'Database Design', 'Query Optimisation', 'Data Modelling',
    ],
  },
  {
    label: 'Cloud & Infrastructure',
    skills: [
      'Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform (GCP)',
      'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Helm',
      'Linux', 'Networking / TCP-IP', 'DNS', 'Load Balancing',
      'CDN', 'Serverless', 'Infrastructure as Code',
      'Site Reliability Engineering (SRE)', 'FinOps',
    ],
  },
  {
    label: 'DevOps & CI/CD',
    skills: [
      'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'ArgoCD',
      'Git', 'Trunk-Based Development', 'Feature Flags',
      'Monitoring & Observability', 'Prometheus', 'Grafana', 'Datadog',
      'OpenTelemetry', 'Incident Management', 'SLOs / SLAs',
    ],
  },
  {
    label: 'Security',
    skills: [
      'Cybersecurity', 'Application Security', 'Penetration Testing',
      'OWASP', 'Identity & Access Management', 'Active Directory',
      'Zero Trust Architecture', 'SIEM', 'Vulnerability Management',
      'Cryptography', 'PKI', 'GDPR', 'SOC 2', 'ISO 27001',
      'Threat Modelling', 'Security Auditing',
    ],
  },
  {
    label: 'Data & Analytics',
    skills: [
      'Data Analysis', 'Data Engineering', 'ETL / ELT', 'Data Warehousing',
      'Apache Spark', 'Apache Airflow', 'dbt', 'SQL',
      'Tableau', 'Power BI', 'Looker', 'Metabase',
      'Statistics', 'A/B Testing', 'Experimental Design',
      'Data Governance', 'Data Quality',
    ],
  },
  {
    label: 'AI & Machine Learning',
    skills: [
      'Machine Learning', 'Deep Learning', 'Natural Language Processing (NLP)',
      'Computer Vision', 'Reinforcement Learning', 'Generative AI',
      'Large Language Models (LLMs)', 'Prompt Engineering',
      'TensorFlow', 'PyTorch', 'scikit-learn', 'Hugging Face',
      'MLOps', 'Feature Engineering', 'Model Evaluation',
      'Responsible AI', 'AI Ethics',
    ],
  },
  {
    label: 'Project & Product Management',
    skills: [
      'Agile', 'Scrum', 'Kanban', 'SAFe', 'PRINCE2', 'PMP',
      'Product Strategy', 'Product Roadmapping', 'OKRs',
      'User Story Mapping', 'Backlog Management', 'Sprint Planning',
      'Stakeholder Management', 'Risk Management', 'Change Management',
      'Jira', 'Confluence', 'Asana', 'Monday.com',
    ],
  },
  {
    label: 'Business Analysis',
    skills: [
      'Business Analysis', 'Requirements Elicitation', 'Process Mapping',
      'BPMN', 'Lean', 'Six Sigma', 'Value Stream Mapping',
      'Gap Analysis', 'Feasibility Studies', 'Cost-Benefit Analysis',
      'Business Intelligence', 'KPI Design', 'Balanced Scorecard',
    ],
  },
  {
    label: 'UX & Design',
    skills: [
      'UX Design', 'UI Design', 'User Research', 'Usability Testing',
      'Information Architecture', 'Interaction Design', 'Prototyping',
      'Wireframing', 'Design Systems', 'Figma', 'Adobe XD',
      'Accessibility Design', 'Graphic Design', 'Adobe Photoshop',
      'Adobe Illustrator', 'Motion Design',
    ],
  },
  {
    label: 'Quality Assurance',
    skills: [
      'Software Testing', 'Test Automation', 'Manual Testing',
      'Selenium', 'Appium', 'Jest', 'Pytest',
      'Performance Testing', 'Load Testing', 'JMeter',
      'Test Planning', 'Bug Reporting', 'BDD / TDD', 'API Testing',
    ],
  },
  {
    label: 'Finance & Accounting',
    skills: [
      'Financial Analysis', 'Financial Modelling', 'Budgeting & Forecasting',
      'Management Accounting', 'IFRS', 'GAAP', 'Tax', 'Audit',
      'Treasury Management', 'Cash Flow Management', 'Mergers & Acquisitions',
      'Valuation', 'Capital Markets', 'Corporate Finance',
      'SAP FI/CO', 'Excel Financial Modelling',
    ],
  },
  {
    label: 'Sales & Business Development',
    skills: [
      'B2B Sales', 'Enterprise Sales', 'Account Management',
      'Sales Strategy', 'Lead Generation', 'Pipeline Management',
      'Negotiation', 'Contract Management', 'Customer Success',
      'Salesforce CRM', 'HubSpot CRM', 'Consultative Selling',
      'Partner Management', 'Channel Sales',
    ],
  },
  {
    label: 'Marketing',
    skills: [
      'Digital Marketing', 'Content Marketing', 'SEO', 'SEM / PPC',
      'Social Media Marketing', 'Email Marketing', 'Marketing Automation',
      'Brand Management', 'Campaign Management', 'Demand Generation',
      'Marketing Analytics', 'Growth Hacking', 'HubSpot',
      'Google Analytics', 'Copywriting', 'Public Relations',
    ],
  },
  {
    label: 'Human Resources',
    skills: [
      'Talent Acquisition', 'Recruiting', 'Employer Branding',
      'Onboarding', 'Learning & Development', 'Performance Management',
      'Compensation & Benefits', 'HR Business Partnering',
      'Workforce Planning', 'Organisational Design',
      'Employee Relations', 'HRIS', 'Succession Planning',
      'Diversity, Equity & Inclusion (DEI)',
    ],
  },
  {
    label: 'Legal & Compliance',
    skills: [
      'Corporate Law', 'Contract Law', 'Intellectual Property',
      'Data Privacy (GDPR)', 'Regulatory Compliance',
      'Employment Law', 'Mergers & Acquisitions (Legal)',
      'Litigation', 'Legal Research', 'Risk & Governance',
      'AML / KYC', 'Competition Law',
    ],
  },
  {
    label: 'Operations & Supply Chain',
    skills: [
      'Operations Management', 'Supply Chain Management', 'Procurement',
      'Vendor Management', 'Logistics', 'Inventory Management',
      'Demand Planning', 'ERP Systems', 'SAP', 'Oracle ERP',
      'Business Continuity', 'ISO 9001', 'Facilities Management',
    ],
  },
  {
    label: 'Leadership & Soft Skills',
    skills: [
      'Leadership', 'People Management', 'Mentoring & Coaching',
      'Team Building', 'Executive Communication', 'Public Speaking',
      'Presentation Skills', 'Technical Writing', 'Business Writing',
      'Critical Thinking', 'Problem Solving', 'Decision Making',
      'Conflict Resolution', 'Emotional Intelligence', 'Cross-functional Collaboration',
      'Remote Team Management',
    ],
  },
]

/** Flat list of all skills for quick lookup / search. */
export const ALL_SKILLS: string[] = SKILL_CATEGORIES.flatMap((c) => c.skills)

/** Find up to `limit` skills whose name includes the query (case-insensitive). */
export function searchSkills(query: string, limit = 10): string[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q)).slice(0, limit)
}
