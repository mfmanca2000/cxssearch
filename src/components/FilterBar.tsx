import React from 'react'
import { X } from 'lucide-react'
import { ActiveFilters } from '@/hooks/useSearch'

interface Props {
  departments: string[]
  cities:      string[]
  countries:   string[]
  filters:     ActiveFilters
  onChange:    (f: ActiveFilters) => void
}

interface ChipGroupProps {
  label:    string
  values:   string[]
  selected: string
  onSelect: (v: string) => void
}

function ChipGroup({ label, values, selected, onSelect }: ChipGroupProps) {
  if (values.length === 0) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider shrink-0">
        {label}
      </span>
      {values.map((v) => {
        const active = selected === v
        return (
          <button
            key={v}
            onClick={() => onSelect(active ? '' : v)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 shrink-0"
            style={
              active
                ? {
                    background: 'rgba(139,92,246,0.2)',
                    borderColor: 'rgba(139,92,246,0.5)',
                    color: '#c4b5fd',
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#64748b',
                  }
            }
          >
            {v}
            {active && <X className="w-3 h-3 ml-0.5" />}
          </button>
        )
      })}
    </div>
  )
}

export function FilterBar({ departments, cities, countries, filters, onChange }: Props) {
  const hasAny = departments.length + cities.length + countries.length > 0
  if (!hasAny) return null

  const active = filters.department || filters.city || filters.country
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 font-medium">Filters</span>
        {active && (
          <button
            onClick={() => onChange({ department: '', city: '', country: '' })}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <ChipGroup
        label="Dept"
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
    </div>
  )
}
