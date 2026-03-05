import React, { useRef } from 'react'
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
      {/* Glow halo behind the input */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
        aria-hidden
      />

      <div
        className="relative flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: value ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)',
          boxShadow: value
            ? '0 0 0 1px rgba(139,92,246,0.3), 0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Search icon / spinner */}
        <div className="shrink-0">
          {loading ? (
            <svg
              className="w-5 h-5 animate-spin text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <Search
              className="w-5 h-5 transition-colors duration-200"
              style={{ color: value ? '#a78bfa' : '#475569' }}
            />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, title, email, department…"
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-base"
          autoFocus
          spellCheck={false}
        />

        {/* Count badge */}
        <AnimatePresence mode="wait">
          {total > 0 && (
            <motion.span
              key={`${filtered}-${total}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              {value ? `${filtered} / ${total}` : `${total} people`}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Clear button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { onChange(''); ref.current?.focus() }}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
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
