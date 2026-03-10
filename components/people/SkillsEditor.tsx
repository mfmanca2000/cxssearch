'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useSkills, useAddSkill, useRemoveSkill } from '@/hooks/useSkills'
import { searchSkills, SKILL_CATEGORIES } from '@/lib/skills'

interface Props {
  dn: string
  /** If true, the editor is interactive (add/remove). If false, read-only chip list. */
  editable?: boolean
}

export function SkillsEditor({ dn, editable = false }: Props) {
  const { data: skills = [], isLoading } = useSkills(dn)
  const addSkill    = useAddSkill(dn)
  const removeSkill = useRemoveSkill(dn)

  const [input, setInput]           = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [focused, setFocused]       = useState(false)
  const [highlightIdx, setHighlight] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef  = useRef<HTMLDivElement>(null)

  // Update suggestions on input change
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([])
      setHighlight(-1)
      return
    }
    const matches = searchSkills(input, 8).filter((s) => !skills.includes(s))
    setSuggestions(matches)
    setHighlight(-1)
  }, [input]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAdd = useCallback((skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed || skills.includes(trimmed)) return
    addSkill.mutate(trimmed)
    setInput('')
    setSuggestions([])
    setFocused(false)
  }, [addSkill, skills])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        handleAdd(suggestions[highlightIdx])
      } else if (input.trim()) {
        handleAdd(input)
      }
    } else if (e.key === 'Escape') {
      setFocused(false)
      setInput('')
    }
  }

  const showDrop = focused && (suggestions.length > 0 || input.trim().length > 0)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading skills…
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Chip list */}
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background:   'rgba(37,99,235,0.1)',
                border:       '1px solid rgba(37,99,235,0.25)',
                color:        '#3b82f6',
              }}
            >
              {skill}
              {editable && (
                <button
                  onClick={() => removeSkill.mutate(skill)}
                  disabled={removeSkill.isPending}
                  className="ml-0.5 rounded-full hover:text-red-400 transition-colors disabled:opacity-40"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        !editable && (
          <p className="text-sm text-slate-400 italic">No skills added yet.</p>
        )
      )}

      {/* Add skill input */}
      {editable && (
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); setFocused(true) }}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Add a skill…"
                className="w-full text-sm px-3 py-1.5 rounded-lg bg-[#f4f7fb] border border-[#e2e8f0] text-[#1b2a4a] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />

              {/* Dropdown */}
              {showDrop && (
                <div
                  ref={dropRef}
                  className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden shadow-xl"
                  style={{ border: '1px solid #e2e8f0', background: '#fff', maxHeight: '240px', overflowY: 'auto' }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onMouseDown={(e) => { e.preventDefault(); handleAdd(s) }}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{
                        background: i === highlightIdx ? '#eff6ff' : 'transparent',
                        color: '#1b2a4a',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                  {/* Free-text option when no exact match */}
                  {input.trim() && !suggestions.includes(input.trim()) && (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleAdd(input) }}
                      className="w-full text-left px-3 py-2 text-sm border-t transition-colors"
                      style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                    >
                      Add &ldquo;<strong className="text-[#1b2a4a]">{input.trim()}</strong>&rdquo;
                    </button>
                  )}
                </div>
              )}
            </div>

            {input.trim() && (
              <button
                onClick={() => handleAdd(input)}
                disabled={addSkill.isPending}
                className="shrink-0 p-1.5 rounded-lg text-white transition disabled:opacity-40"
                style={{ background: '#2563eb' }}
                aria-label="Add skill"
              >
                {addSkill.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Plus className="w-4 h-4" />
                }
              </button>
            )}
          </div>

          {/* Category quick-picks (shown when input is empty and focused) */}
          {focused && !input && (
            <div
              ref={dropRef}
              className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl shadow-xl p-3 space-y-3"
              style={{ border: '1px solid #e2e8f0', background: '#fff', maxHeight: '300px', overflowY: 'auto' }}
            >
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider px-1">Browse by category</p>
              {SKILL_CATEGORIES.map((cat) => {
                const unowned = cat.skills.filter((s) => !skills.includes(s))
                if (!unowned.length) return null
                return (
                  <div key={cat.label}>
                    <p className="text-xs font-semibold text-slate-500 mb-1 px-1">{cat.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {unowned.slice(0, 6).map((s) => (
                        <button
                          key={s}
                          onMouseDown={(e) => { e.preventDefault(); handleAdd(s) }}
                          className="text-xs px-2 py-0.5 rounded-full border transition-colors hover:border-blue-300 hover:bg-blue-50"
                          style={{ border: '1px solid #e2e8f0', color: '#475569' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
