'use client'

const GRADIENT_PAIRS = [
  ['#7c3aed', '#06b6d4'],
  ['#db2777', '#f97316'],
  ['#059669', '#06b6d4'],
  ['#2563eb', '#7c3aed'],
  ['#dc2626', '#f97316'],
  ['#7c3aed', '#ec4899'],
  ['#0891b2', '#059669'],
  ['#9333ea', '#f59e0b'],
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Props {
  name: string
  photo?: string | null
  size?: number
  className?: string
}

export function Avatar({ name, photo, size = 44, className = '' }: Props) {
  const [from, to] = GRADIENT_PAIRS[hashName(name) % GRADIENT_PAIRS.length]
  const fontSize = Math.round(size * 0.36)

  if (photo) {
    const src = photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={`rounded-full shrink-0 flex items-center justify-center font-semibold text-white select-none ${className}`}
      style={{
        width:      size,
        height:     size,
        fontSize,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow:  '0 0 0 2px rgba(255,255,255,0.08)',
      }}
    >
      {initials(name)}
    </div>
  )
}
