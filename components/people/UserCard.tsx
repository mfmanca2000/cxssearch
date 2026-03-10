'use client'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Briefcase, MessageSquarePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { Avatar } from './Avatar'

interface Props {
  user: User
  onClick: (u: User) => void
  index: number
}

export function UserCard({ user, onClick, index }: Props) {
  const router = useRouter()

  const handleAskExpert = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/qa/ask?expert=${encodeURIComponent(user.dn)}&expert_name=${encodeURIComponent(user.cn)}`)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(27,42,74,0.12)' }}
      onClick={() => onClick(user)}
      className="group cursor-pointer rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden bg-white border border-[#e2e8f0]"
      style={{ boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(user)}
      aria-label={`View profile of ${user.cn}`}
    >
      {/* Hover top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, #1b2a4a, #2563eb)' }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 relative">
        <Avatar name={user.cn} photo={user.photo} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1b2a4a] truncate leading-tight">{user.cn}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {user.username && <span className="text-slate-300">@{user.username} · </span>}
            {user.title}
          </p>
        </div>
      </div>

      {user.department && (
        <span
          className="self-start text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
        >
          {user.department}
        </span>
      )}

      <dl className="space-y-1.5 text-xs text-slate-500">
        {user.mail && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 shrink-0 text-[#1b2a4a] opacity-50" />
            <a
              href={`mailto:${user.mail}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-[#2563eb] transition-colors"
            >
              {user.mail}
            </a>
          </div>
        )}
        {(user.phone || user.mobile) && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0 text-[#1b2a4a] opacity-50" />
            <span className="truncate">{user.phone || user.mobile}</span>
          </div>
        )}
        {(user.city || user.office) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1b2a4a] opacity-50" />
            <span className="truncate">
              {[user.office, user.city, user.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {!user.mail && !user.phone && !user.city && user.company && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 shrink-0 text-[#1b2a4a] opacity-50" />
            <span className="truncate">{user.company}</span>
          </div>
        )}
      </dl>

      {/* Ask Expert button */}
      <button
        onClick={handleAskExpert}
        className="mt-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border opacity-0 group-hover:opacity-100 transition-all duration-200 self-start"
        style={{
          background:   '#eff6ff',
          borderColor:  '#bfdbfe',
          color:        '#1d4ed8',
        }}
        title={`Ask ${user.cn} a question`}
      >
        <MessageSquarePlus className="w-3.5 h-3.5" />
        Ask Expert
      </button>
    </motion.article>
  )
}
