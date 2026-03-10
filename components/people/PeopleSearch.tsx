'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Users, AlertCircle, Info } from 'lucide-react'
import type { OrgNode, User } from '@/types'

/** True when the user belongs directly to the selected node (not a sub-node). */
function isDirectUser(user: User, selectedDN: string): boolean {
  if (!selectedDN) return true
  if (selectedDN.includes('=')) {
    // LDAP DN mode: strip the first RDN (cn=...) and compare parent to selectedDN
    const parentDN = user.dn.replace(/^[^,]+,/, '')
    return parentDN.toLowerCase() === selectedDN.toLowerCase()
  }
  // Dept-code mode: exact department match
  return user.department === selectedDN
}
import { useSearch, useFilterOptions, type ActiveFilters } from '@/hooks/useSearch'
import { OrgTreePanel } from './OrgTreePanel'
import { SearchBar } from './SearchBar'
import { FilterBar } from './FilterBar'
import { UserCard } from './UserCard'
import { UserModal } from './UserModal'
import { SkeletonCard } from './SkeletonCard'

const EMPTY_FILTERS: ActiveFilters = { department: '', city: '', country: '' }

async function fetchTree(): Promise<OrgNode> {
  const res = await fetch('/api/tree')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function fetchUsers(base: string): Promise<User[]> {
  const res = await fetch(`/api/users?base=${encodeURIComponent(base)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: '#eff6ff' }}
      >
        <Users className="w-8 h-8 text-[#2563eb]" />
      </div>
      <p className="text-[#1b2a4a] font-medium">
        {query ? `No results for "${query}"` : 'No people in this branch'}
      </p>
      <p className="text-slate-400 text-sm mt-1">
        {query ? 'Try a different search term or clear the filters.' : 'Select a different node in the tree.'}
      </p>
    </motion.div>
  )
}

function HintBanner({ mock }: { mock: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  if (!mock || dismissed) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs mb-4 shrink-0"
      style={{
        background: '#eff6ff',
        border:     '1px solid #bfdbfe',
        color:      '#1d4ed8',
      }}
    >
      <Info className="w-4 h-4 shrink-0" />
      <span>
        Running in <strong>demo mode</strong> with mock data. Set AD credentials in{' '}
        <code className="bg-[#1b2a4a]/10 px-1 rounded">.env.local</code> and restart.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 hover:text-[#1b2a4a] transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

export function PeopleSearch() {
  const [selectedDN, setSelectedDN] = useState('')
  const [query,      setQuery]      = useState('')
  const [filters,    setFilters]    = useState<ActiveFilters>(EMPTY_FILTERS)
  const [activeUser, setActiveUser] = useState<User | null>(null)

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn:  () => fetch('/api/config').then((r) => r.json()) as Promise<{ baseDN: string; mockMode: boolean }>,
    staleTime: Infinity,
  })

  const treeQuery = useQuery({
    queryKey: ['tree'],
    queryFn:  fetchTree,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (treeQuery.data && !selectedDN) {
      setSelectedDN(treeQuery.data.dn)
    }
  }, [treeQuery.data, selectedDN])

  const usersQuery = useQuery({
    queryKey: ['users', selectedDN],
    queryFn:  () => fetchUsers(selectedDN),
    enabled:  !!selectedDN,
    staleTime: 5 * 60 * 1000,
  })

  const allUsers = usersQuery.data ?? []
  const filtered = useSearch(allUsers, query, filters)

  const directFiltered = useMemo(
    () => filtered.filter((u) => isDirectUser(u, selectedDN)),
    [filtered, selectedDN],
  )
  const subFiltered = useMemo(
    () => filtered.filter((u) => !isDirectUser(u, selectedDN)),
    [filtered, selectedDN],
  )

  // Faceted filter options: each dimension only shows values present in
  // users that satisfy the OTHER two active filters, so clicking any chip
  // always yields at least one result.
  const usersForCityOpts = useMemo(
    () => allUsers.filter(u =>
      (!filters.department || u.department === filters.department) &&
      (!filters.country    || u.country    === filters.country)
    ),
    [allUsers, filters.department, filters.country],
  )
  const usersForDeptOpts = useMemo(
    () => allUsers.filter(u =>
      (!filters.city    || u.city    === filters.city) &&
      (!filters.country || u.country === filters.country)
    ),
    [allUsers, filters.city, filters.country],
  )
  const usersForCountryOpts = useMemo(
    () => allUsers.filter(u =>
      (!filters.department || u.department === filters.department) &&
      (!filters.city       || u.city       === filters.city)
    ),
    [allUsers, filters.department, filters.city],
  )

  const departments = useFilterOptions(usersForDeptOpts,    'department')
  const cities      = useFilterOptions(usersForCityOpts,    'city')
  const countries   = useFilterOptions(usersForCountryOpts, 'country')

  const handleSelectBranch = useCallback((dn: string) => {
    setSelectedDN(dn)
    setQuery('')
    setFilters(EMPTY_FILTERS)
  }, [])

  if (treeQuery.isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl text-center max-w-sm bg-white border border-red-100"
          style={{ boxShadow: '0 2px 12px rgba(220,38,38,0.08)' }}
        >
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-[#1b2a4a] font-semibold">Could not connect to the server</p>
          <p className="text-slate-500 text-sm">
            Make sure your .env.local is configured with LDAP or MOCK_MODE=true.
          </p>
          <code className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {String((treeQuery.error as Error)?.message ?? treeQuery.error)}
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar org tree */}
      <aside className="w-64 lg:w-72 flex-shrink-0 flex flex-col h-full overflow-hidden border-r border-[#e2e8f0]">
        <OrgTreePanel
          tree={treeQuery.data ?? null}
          selected={selectedDN}
          onSelect={handleSelectBranch}
          loading={treeQuery.isLoading}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <div className="px-6 pt-6 pb-4 shrink-0 border-b border-[#e2e8f0] bg-white">
          <HintBanner mock={config?.mockMode ?? false} />
          <SearchBar
            value={query}
            onChange={setQuery}
            total={allUsers.length}
            filtered={filtered.length}
            loading={usersQuery.isFetching}
          />
          {allUsers.length > 0 && (
            <div className="mt-4">
              <FilterBar
                departments={departments}
                cities={cities}
                countries={countries}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          )}
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {usersQuery.isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {usersQuery.isError && (
            <div className="flex flex-col items-center py-20 text-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-slate-500">Failed to load people for this branch.</p>
              <p className="text-slate-400 text-sm">
                {String((usersQuery.error as Error)?.message)}
              </p>
            </div>
          )}

          {!usersQuery.isLoading && !usersQuery.isError && (
            <>
              {filtered.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <>
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                  >
                    <AnimatePresence mode="popLayout">
                      {directFiltered.map((u, i) => (
                        <UserCard key={u.dn} user={u} index={i} onClick={setActiveUser} />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {directFiltered.length > 0 && subFiltered.length > 0 && (
                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-[#e2e8f0]" />
                      <span className="text-xs font-medium text-slate-400 shrink-0">
                        Also in sub-teams
                      </span>
                      <div className="flex-1 h-px bg-[#e2e8f0]" />
                    </div>
                  )}

                  {subFiltered.length > 0 && (
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {subFiltered.map((u, i) => (
                          <UserCard key={u.dn} user={u} index={directFiltered.length + i} onClick={setActiveUser} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <UserModal user={activeUser} onClose={() => setActiveUser(null)} />
    </div>
  )
}
