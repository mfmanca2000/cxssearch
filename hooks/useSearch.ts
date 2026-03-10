import { useMemo } from 'react'
import type { User } from '@/types'

export interface ActiveFilters {
  department: string
  city: string
  country: string
}

const EMPTY_FILTERS: ActiveFilters = { department: '', city: '', country: '' }

export function useSearch(
  users: User[],
  query: string,
  filters: ActiveFilters = EMPTY_FILTERS,
): User[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase()

    return users.filter((u) => {
      const textOk = !q || [
        u.cn, u.username, u.mail, u.title,
        u.department, u.office, u.city, u.phone, u.mobile,
      ].some((v) => v?.toLowerCase().includes(q))

      const deptOk    = !filters.department || u.department === filters.department
      const cityOk    = !filters.city       || u.city       === filters.city
      const countryOk = !filters.country    || u.country    === filters.country

      return textOk && deptOk && cityOk && countryOk
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
