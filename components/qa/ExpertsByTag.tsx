'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useExperts } from '@/hooks/useQA'
import { ExpertCard } from './ExpertCard'
import { TagChip } from './TagChip'

interface Props {
  tag: string
}

export function ExpertsByTag({ tag }: Props) {
  const { data: experts, isLoading } = useExperts({ tag })

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/qa/experts"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> All experts
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-700">Experts in</h1>
          <TagChip tag={tag} size="md" />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        )}

        {!isLoading && !experts?.length && (
          <p className="text-slate-500 py-8 text-center">
            No experts found for &ldquo;{tag}&rdquo; yet. Be the first to answer!
          </p>
        )}

        {!isLoading && experts && experts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((exp) => (
              <ExpertCard key={exp.dn} expert={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
