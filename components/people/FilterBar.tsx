'use client'
import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { ActiveFilters } from '@/hooks/useSearch'

interface Props {
  departments: string[]
  cities:      string[]
  countries:   string[]
  filters:     ActiveFilters
  onChange:    (f: ActiveFilters) => void
  skills?:     string[]
}

interface ChipGroupProps {
  label:       string
  values:      string[]
  selected:    string
  onSelect:    (v: string) => void
  activeStyle?: React.CSSProperties
}

function ChipGroup({ label, values, selected, onSelect, activeStyle }: ChipGroupProps) {
  const [open, setOpen] = useState(false)
  if (values.length === 0) return null

  const defaultActiveStyle = { background: '#1b2a4a', borderColor: '#1b2a4a', color: '#ffffff' }
  const isActive = !!selected

  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50"
        style={isActive ? { background: '#eff6ff', color: '#1d4ed8' } : { color: '#64748b' }}
      >
        <span className="uppercase tracking-wider">
          {label}
          {isActive && (
            <span className="ml-2 normal-case font-normal truncate max-w-[120px] inline-block align-bottom">
              : {selected}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {isActive && (
            <span
              onClick={(e) => { e.stopPropagation(); onSelect('') }}
              className="p-0.5 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
              role="button"
              aria-label={`Clear ${label} filter`}
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Chip list */}
      {open && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border-t border-[#e2e8f0] bg-white">
          {values.map((v) => {
            const active = selected === v
            return (
              <button
                key={v}
                onClick={() => onSelect(active ? '' : v)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 shrink-0"
                style={
                  active
                    ? (activeStyle ?? defaultActiveStyle)
                    : { background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }
                }
              >
                {v}
                {active && <X className="w-3 h-3 ml-0.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ departments, cities, countries, filters, onChange, skills }: Props) {
  const hasAny = departments.length + cities.length + countries.length + (skills?.length ?? 0) > 0
  if (!hasAny) return null

  const active = filters.department || filters.city || filters.country || filters.skill
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-medium">Filters</span>
        {active && (
          <button
            onClick={() => onChange({ department: '', city: '', country: '', skill: '' })}
            className="text-xs text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <ChipGroup
        label="Department"
        values={departments}
        selected={filters.department}
        onSelect={(v) => onChange({ ...filters, department: v })}
      />
      <ChipGroup
        label="City"
        values={cities}
        selected={filters.city}
        onSelect={(v) => onChange({ ...filters, city: v })}
      />
      <ChipGroup
        label="Country"
        values={countries}
        selected={filters.country}
        onSelect={(v) => onChange({ ...filters, country: v })}
      />
      {skills && skills.length > 0 && (
        <ChipGroup
          label="Skill"
          values={skills}
          selected={filters.skill}
          onSelect={(v) => onChange({ ...filters, skill: v })}
          activeStyle={{ background: '#6d28d9', borderColor: '#6d28d9', color: '#ffffff' }}
        />
      )}
    </div>
  )
}
