'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { X, Plus, Send, UserCheck, Users, Search } from 'lucide-react'
import { postQuestion } from '@/app/actions/qa'
import { SimilarQuestions } from './SimilarQuestions'
import { TagChip } from './TagChip'
import { useExperts, useTags } from '@/hooks/useQA'
import type { OrgNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Flatten an OrgNode tree into a list of { dn, label } for all non-root nodes. */
function flattenTree(node: OrgNode, depth = 0, parentPath = ''): { dn: string; label: string; depth: number }[] {
  const results: { dn: string; label: string; depth: number }[] = []
  const fullPath = parentPath ? `${parentPath} > ${node.name}` : node.name
  if (depth > 0) results.push({ dn: node.dn, label: fullPath, depth })
  for (const child of node.children) results.push(...flattenTree(child, depth + 1, fullPath))
  return results
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default), { ssr: false })

export function QuestionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const expertDn   = searchParams.get('expert')
  const expertName = searchParams.get('expert_name')
  const preTag     = searchParams.get('tag')

  const [title,        setTitle]        = useState('')
  const [body,         setBody]         = useState('')
  const [tagInput,     setTagInput]     = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [tags,         setTags]         = useState<string[]>(preTag ? [preTag] : [])
  const [directedDns,  setDirectedDns]  = useState<string[]>(expertDn ? [expertDn] : [])
  const [directedTeams, setDirectedTeams] = useState<string[]>([])
  const [teams,        setTeams]        = useState<{ dn: string; label: string; depth: number }[]>([])
  const [expertSearch, setExpertSearch] = useState('')
  const [error,        setError]        = useState('')
  const [isPending,    startTransition] = useTransition()
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Load org tree for team selector
  useEffect(() => {
    fetch('/api/tree')
      .then((r) => r.json())
      .then((tree: OrgNode) => setTeams(flattenTree(tree)))
      .catch(() => {})
  }, [])

  // Tag autocomplete
  const { data: allTags } = useTags()
  const tagSuggestions = allTags
    ?.filter((t) => t.tag.includes(tagInput.toLowerCase().trim()) && !tags.includes(t.tag))
    ?? []

  // Expert suggestions: filtered by first tag + optional free-text search
  const primaryTag = tags[0] ?? ''
  const { data: experts } = useExperts(
    primaryTag || expertSearch
      ? { tag: primaryTag || undefined, q: expertSearch || undefined }
      : undefined,
  )

  const addTag = (t: string) => {
    const clean = t.trim().toLowerCase().replace(/\s+/g, '-')
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags((prev) => [...prev, clean])
    }
    setTagInput('')
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const toggleExpert = (dn: string) => {
    setDirectedDns((prev) =>
      prev.includes(dn) ? prev.filter((d) => d !== dn) : [...prev, dn],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!body.trim())  { setError('Body is required');  return }
    setError('')
    startTransition(async () => {
      try {
        await postQuestion({ title: title.trim(), body: body.trim(), tags, directed_dns: directedDns, directed_team_ous: directedTeams })
      } catch (err) {
        setError(String((err as Error).message))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">

      {expertName && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-brand-50 border border-brand-200 text-brand-700">
          <UserCheck className="w-4 h-4 shrink-0" />
          Directing this question to <strong>{expertName}</strong>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is your question? Be specific."
          className="h-10 text-sm"
          maxLength={200}
          required
        />
        {title.length >= 5 && <SimilarQuestions title={title} />}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Details</label>
        <div data-color-mode="light">
          <MDEditor
            value={body}
            onChange={(v) => setBody(v ?? '')}
            height={260}
            preview="edit"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Tags <span className="text-slate-500 font-normal">(up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1">
              <TagChip tag={t} />
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={`Remove tag ${t}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {tags.length < 5 && (
          <div className="relative flex gap-2">
            <Input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true) }}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
                if (e.key === ',')     { e.preventDefault(); addTag(tagInput) }
                if (e.key === 'Escape') setShowTagSuggestions(false)
              }}
              placeholder="Add a tag (Enter or comma)"
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag(tagInput)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {showTagSuggestions && tagSuggestions.length > 0 && (
              <ul className="absolute top-full left-0 mt-1 w-full z-20 rounded-lg overflow-hidden shadow-lg bg-white border border-input">
                {tagSuggestions.slice(0, 8).map((t) => (
                  <li key={t.tag}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addTag(t.tag) }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-slate-700">{t.tag}</span>
                      <span className="text-xs text-slate-500">{t.question_count}q</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Expert routing */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Notify experts{' '}
          <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        {/* Expert search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={expertSearch}
            onChange={(e) => setExpertSearch(e.target.value)}
            placeholder={primaryTag ? `Search experts for "${primaryTag}"…` : 'Search experts by name, title, or skill…'}
            className="pl-9 text-sm"
          />
        </div>
        {experts && experts.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {experts.map((exp) => {
              const selected = directedDns.includes(exp.dn)
              return (
                <Badge
                  key={exp.dn}
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleExpert(exp.dn)}
                  title={exp.title ? `${exp.title} · ${exp.department}` : exp.department}
                  className="cursor-pointer flex items-center gap-1"
                >
                  {exp.cn}
                  {selected && <X className="w-3 h-3" />}
                </Badge>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {primaryTag || expertSearch ? 'No experts found — try a different search.' : 'Add a tag above to see relevant experts.'}
          </p>
        )}
      </div>

      {/* Team routing */}
      {teams.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Notify a team <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <Select
              value=""
              onValueChange={(ou) => {
                if (ou && !directedTeams.includes(ou)) setDirectedTeams((p) => [...p, ou])
              }}
            >
              <SelectTrigger className="w-full pl-9 h-10 text-sm">
                <SelectValue placeholder="Select a team…" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.dn} value={t.dn}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {directedTeams.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {directedTeams.map((ou) => {
                const team = teams.find((t) => t.dn === ou)
                return (
                  <Badge
                    key={ou}
                    className="bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5"
                  >
                    <Users className="w-3 h-3" />
                    {team?.label ?? ou}
                    <button
                      type="button"
                      onClick={() => setDirectedTeams((p) => p.filter((d) => d !== ou))}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove team ${team?.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        {isPending ? 'Posting…' : 'Post Question'}
      </Button>
    </form>
  )
}
