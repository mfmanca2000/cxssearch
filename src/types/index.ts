export interface OrgNode {
  dn: string
  name: string
  children: OrgNode[]
}

export interface User {
  dn: string
  cn: string
  username: string
  mail: string
  title: string
  department: string
  phone: string
  mobile: string
  office: string
  city: string
  country: string
  company: string
  manager: string
  photo: string | null
}
