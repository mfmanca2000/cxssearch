import { useMemo } from 'react'
import type { User } from '@/types'

export interface ActiveFilters {
  department: string
  city: string
  country: string
  skill: string
}

const EMPTY_FILTERS: ActiveFilters = { department: '', city: '', country: '', skill: '' }

export function useSearch(
  users: User[],
  query: string,
  filters: ActiveFilters = EMPTY_FILTERS,
): User[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase()

    return users.filter((u) => {
      const skills = (u as any).skills as string[] | undefined

      const textOk = !q || [
        u.cn, u.username, u.mail, u.title,
        u.department, u.office, u.city, u.phone, u.mobile,
        skills?.join(' '),
      ].some((v) => v?.toLowerCase().includes(q))

      const deptOk    = !filters.department || u.department === filters.department
      const cityOk    = !filters.city       || u.city       === filters.city
      const countryOk = !filters.country    || u.country    === filters.country
      const skillOk   = !filters.skill      || skills?.includes(filters.skill)

      return textOk && deptOk && cityOk && countryOk && skillOk
    })
  }, [users, query, filters])
}

export function useFilterOptions(users: User[], field: keyof User): string[] {
  return useMemo(() => {
    const set = new Set<string>()
    for (const u of users) {
      const v = u[field]
      if (v && typeof v === 'string') set.add(v)
    }
    return Array.from(set).sort()
  }, [users, field])
}
