'use client'
import Link from 'next/link'

interface Props {
  tag: string
  count?: number
  linked?: boolean
  size?: 'sm' | 'md'
}

export function TagChip({ tag, count, linked = false, size = 'sm' }: Props) {
  const cls = size === 'md'
    ? 'text-sm px-3 py-1.5'
    : 'text-xs px-2.5 py-1'

  const inner = (
    <span
      className={`inline-flex items-center gap-1 ${cls} rounded-full font-medium cursor-pointer transition-all duration-150 hover:border-brand-500`}
      style={{
        background:   'rgba(139,92,246,0.1)',
        color:        '#c4b5fd',
        border:       '1px solid rgba(139,92,246,0.25)',
      }}
    >
      {tag}
      {count !== undefined && (
        <span className="text-brand-400 opacity-70">×{count}</span>
      )}
    </span>
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
