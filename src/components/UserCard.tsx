import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { User } from '@/types'
import { Avatar } from './Avatar'

interface Props {
  user: User
  onClick: (u: User) => void
  index: number
}

export function UserCard({ user, onClick, index }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4, scale: 1.015 }}
      onClick={() => onClick(user)}
      className="group cursor-pointer rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border:     '1px solid rgba(255,255,255,0.07)',
        boxShadow:  '0 2px 16px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(user)}
      aria-label={`View profile of ${user.cn}`}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Gradient top-border on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
        }}
      />

      {/* Header row */}
      <div className="flex items-start gap-3 relative">
        <Avatar name={user.cn} photo={user.photo} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 truncate leading-tight">
            {user.cn}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {user.username && <span className="text-slate-500">@{user.username} · </span>}
            {user.title}
          </p>
        </div>
      </div>

      {/* Department badge */}
      {user.department && (
        <span
          className="self-start text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: 'rgba(139,92,246,0.12)',
            color: '#c4b5fd',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {user.department}
        </span>
      )}

      {/* Details */}
      <dl className="space-y-1.5 text-xs text-slate-400">
        {user.mail && (
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <a
              href={`mailto:${user.mail}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-brand-400 transition-colors"
            >
              {user.mail}
            </a>
          </div>
        )}
        {(user.phone || user.mobile) && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{user.phone || user.mobile}</span>
          </div>
        )}
        {(user.city || user.office) && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span className="truncate">
              {[user.office, user.city, user.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {!user.mail && !user.phone && !user.city && user.company && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{user.company}</span>
          </div>
        )}
      </dl>
    </motion.article>
  )
}
