'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Users } from 'lucide-react'
import { useExperts } from '@/hooks/useQA'
import { ExpertCard } from './ExpertCard'
import { searchSkills } from '@/lib/skills'

export function ExpertDirectory() {
  const [search, setSearch]           = useState('')
  const [dept, setDept]               = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDrop, setShowDrop]       = useState(false)
  const [highlightIdx, setHighlight]  = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef  = useRef<HTMLDivElement>(null)

  // Pass q server-side: changes the query key on each search term → always fresh fetch
  // that filters before the 100-record cap, so newly-added skills are always found.
  const q = search.trim()
  const { data: experts = [], isLoading } = useExperts(
    q ? { q } : undefined
  )

  // Update skill suggestions whenever search changes
  useEffect(() => {
    if (!q) { setSuggestions([]); setHighlight(-1); return }
    setSuggestions(searchSkills(q, 6))
    setHighlight(-1)
  }, [q])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Derive department list from the unfiltered set (no search) so chips stay stable
  const { data: allExperts = [] } = useExperts()
  const departments = useMemo(() => {
    const set = new Set<string>()
    for (const e of allExperts) if (e.department) set.add(e.department)
    return Array.from(set).sort()
  }, [allExperts])

  // Department filter is still client-side (fast, no extra request)
  const filtered = useMemo(
    () => dept ? experts.filter((e) => e.department.toLowerCase() === dept.toLowerCase()) : experts,
    [experts, dept],
  )

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowDrop(true) }}
          onFocus={() => setShowDrop(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((i) => Math.min(i + 1, suggestions.length - 1)) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((i) => Math.max(i - 1, -1)) }
            else if (e.key === 'Enter' && highlightIdx >= 0 && suggestions[highlightIdx]) {
              e.preventDefault(); setSearch(suggestions[highlightIdx]); setShowDrop(false)
            }
            else if (e.key === 'Escape') setShowDrop(false)
          }}
          placeholder="Search by name, title, or skill…"
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          style={{ borderColor: '#e2e8f0' }}
        />
        {showDrop && suggestions.length > 0 && (
          <div
            ref={dropRef}
            className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden shadow-xl"
            style={{ border: '1px solid #e2e8f0', background: '#fff' }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); setSearch(s); setShowDrop(false) }}
                className="w-full text-left px-3 py-2 text-sm transition-colors"
                style={{ background: i === highlightIdx ? '#eff6ff' : 'transparent', color: '#1b2a4a' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Department filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDept('')}
          className="text-xs px-3 py-1.5 rounded-full border transition-all"
          style={
            !dept
              ? { background: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.5)', color: '#c4b5fd' }
              : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
          }
        >
          All departments
        </button>
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d === dept ? '' : d)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={
              dept === d
                ? { background: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.5)', color: '#c4b5fd' }
                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
            }
          >
            {d}
          </button>
        ))}
      </div>

      {/* Skeleton grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="text-slate-400">No experts match your search.</p>
          <p className="text-slate-600 text-sm mt-1">Try a different name, skill, or department.</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && filtered.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'person' : 'people'}
            {dept && ` in ${dept}`}
            {search && ` matching "${search}"`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((exp) => (
              <ExpertCard key={exp.dn} expert={exp} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
