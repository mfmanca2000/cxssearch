import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Users, AlertCircle, Info } from 'lucide-react'
import axios from 'axios'
import { OrgNode, User } from '@/types'
import { useSearch, useFilterOptions, ActiveFilters } from '@/hooks/useSearch'
import { OrgTreePanel } from '@/components/OrgTreePanel'
import { SearchBar } from '@/components/SearchBar'
import { FilterBar } from '@/components/FilterBar'
import { UserCard } from '@/components/UserCard'
import { UserModal } from '@/components/UserModal'
import { SkeletonCard } from '@/components/SkeletonCard'

const EMPTY_FILTERS: ActiveFilters = { department: '', city: '', country: '' }

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchTree(): Promise<OrgNode> {
  const { data } = await axios.get<OrgNode>('/api/tree')
  return data
}

async function fetchUsers(base: string): Promise<User[]> {
  const { data } = await axios.get<User[]>('/api/users', { params: { base } })
  return data
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(139,92,246,0.1)' }}
      >
        <Users className="w-8 h-8 text-brand-400" />
      </div>
      <p className="text-slate-300 font-medium">
        {query ? `No results for "${query}"` : 'No people in this branch'}
      </p>
      <p className="text-slate-600 text-sm mt-1">
        {query ? 'Try a different search term or clear the filters.' : 'Select a different node in the tree.'}
      </p>
    </motion.div>
  )
}

// ─── Hint banner ─────────────────────────────────────────────────────────────

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
        background: 'rgba(6,182,212,0.08)',
        border: '1px solid rgba(6,182,212,0.2)',
        color: '#67e8f9',
      }}
    >
      <Info className="w-4 h-4 shrink-0" />
      <span>Running in <strong>demo mode</strong> with mock data. Set your AD credentials in <code className="bg-white/10 px-1 rounded">.env</code> and restart.</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedDN, setSelectedDN] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [activeUser, setActiveUser] = useState<User | null>(null)

  // ── Config ──
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => axios.get('/api/config').then((r) => r.data as { baseDN: string; mockMode: boolean }),
    staleTime: Infinity,
  })

  // ── Tree ──
  const treeQuery = useQuery({
    queryKey: ['tree'],
    queryFn: fetchTree,
    staleTime: 5 * 60 * 1000,
  })

  // Set initial selection to root once tree loads
  React.useEffect(() => {
    if (treeQuery.data && !selectedDN) {
      setSelectedDN(treeQuery.data.dn)
    }
  }, [treeQuery.data, selectedDN])

  // ── Users ──
  const usersQuery = useQuery({
    queryKey: ['users', selectedDN],
    queryFn: () => fetchUsers(selectedDN),
    enabled: !!selectedDN,
    staleTime: 5 * 60 * 1000,
  })

  const allUsers = usersQuery.data ?? []

  // ── Search + filter (instant, client-side) ──
  const filtered = useSearch(allUsers, query, filters)

  // ── Filter options derived from the current branch ──
  const departments = useFilterOptions(allUsers, 'department')
  const cities      = useFilterOptions(allUsers, 'city')
  const countries   = useFilterOptions(allUsers, 'country')

  const handleSelectBranch = useCallback((dn: string) => {
    setSelectedDN(dn)
    setQuery('')
    setFilters(EMPTY_FILTERS)
  }, [])

  // ── Error state ──
  if (treeQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-animated">
        <div
          className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl text-center max-w-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,0,0,0.15)' }}
        >
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-slate-200 font-semibold">Could not connect to the server</p>
          <p className="text-slate-500 text-sm">
            Make sure the API server is running on port 3001 and your .env is configured.
          </p>
          <code className="text-xs text-red-300 bg-red-950/40 px-3 py-2 rounded-lg">
            {String((treeQuery.error as Error)?.message ?? treeQuery.error)}
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-animated min-h-screen flex flex-col">
      <div className="relative z-10 flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="sidebar w-64 lg:w-72 xl:w-80 flex-shrink-0 flex flex-col h-full overflow-hidden"
        >
          {/* Logo */}
          <div
            className="px-5 py-5 flex items-center gap-3 border-b shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
            >
              C
            </div>
            <div>
              <span className="font-semibold text-slate-100 text-sm">CSX Search</span>
              <p className="text-slate-600 text-xs">People Finder</p>
            </div>
          </div>

          <OrgTreePanel
            tree={treeQuery.data ?? null}
            selected={selectedDN}
            onSelect={handleSelectBranch}
            loading={treeQuery.isLoading}
          />
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">

          {/* ── Top bar ── */}
          <div
            className="px-6 pt-6 pb-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <HintBanner mock={config?.mockMode ?? false} />
            <SearchBar
              value={query}
              onChange={setQuery}
              total={allUsers.length}
              filtered={filtered.length}
              loading={usersQuery.isFetching}
            />

            {/* Filter chips */}
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

          {/* ── Results grid ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Skeleton loading */}
            {usersQuery.isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error loading users */}
            {usersQuery.isError && (
              <div className="flex flex-col items-center py-20 text-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-slate-400">Failed to load people for this branch.</p>
                <p className="text-slate-600 text-sm">
                  {String((usersQuery.error as Error)?.message)}
                </p>
              </div>
            )}

            {/* Results */}
            {!usersQuery.isLoading && !usersQuery.isError && (
              <>
                {filtered.length === 0 ? (
                  <EmptyState query={query} />
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                  >
                    <AnimatePresence mode="popLayout">
                      {filtered.map((u, i) => (
                        <UserCard
                          key={u.dn}
                          user={u}
                          index={i}
                          onClick={setActiveUser}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Profile slide-over ── */}
      <UserModal user={activeUser} onClose={() => setActiveUser(null)} />
    </div>
  )
}
