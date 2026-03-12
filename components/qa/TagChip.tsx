'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Props {
  tag: string
  count?: number
  linked?: boolean
  size?: 'sm' | 'md'
}

export function TagChip({ tag, count, linked = false, size = 'sm' }: Props) {
  const inner = (
    <Badge
      className={`bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 cursor-pointer font-medium ${size === 'md' ? 'text-sm px-3 py-1.5' : ''}`}
    >
      {tag}
      {count !== undefined && (
        <span className="text-brand-500 opacity-70 ml-0.5">×{count}</span>
      )}
    </Badge>
  )

  if (linked) {
    return (
      <Link href={`/qa/experts/${encodeURIComponent(tag)}`}>
        {inner}
      </Link>
    )
  }
  return inner
}
