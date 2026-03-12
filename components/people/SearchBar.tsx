'use client'
import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  value: string
  onChange: (v: string) => void
  total: number
  filtered: number
  loading?: boolean
}

export function SearchBar({ value, onChange, total, filtered, loading }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="relative w-full">
      <div
        className="relative flex items-center gap-3 px-5 py-4 rounded-2xl border bg-white transition-all duration-200"
        style={{
          borderColor: value ? '#2563eb' : '#e2e8f0',
          boxShadow: value
            ? '0 0 0 3px rgba(37,99,235,0.12), 0 2px 8px rgba(27,42,74,0.08)'
            : '0 1px 4px rgba(27,42,74,0.06)',
        }}
      >
        <div className="shrink-0">
          {loading ? (
            <svg className="w-5 h-5 animate-spin text-[#2563eb]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <Search
              className="w-5 h-5 transition-colors duration-200"
              style={{ color: value ? '#2563eb' : '#94a3b8' }}
            />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, title, department, skill…"
          className="flex-1 bg-transparent outline-none text-[#1b2a4a] placeholder-slate-400 text-base"
          autoFocus
          spellCheck={false}
        />

        <AnimatePresence mode="wait">
          {total > 0 && (
            <motion.span
              key={`${filtered}-${total}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: '#eff6ff',
                color:      '#1d4ed8',
                border:     '1px solid #bfdbfe',
              }}
            >
              {value ? `${filtered} / ${total}` : `${total} people`}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { onChange(''); ref.current?.focus() }}
              className="shrink-0 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#1b2a4a] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
