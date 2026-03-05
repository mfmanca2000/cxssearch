import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Smartphone, MapPin, Building2, Briefcase, User as UserIcon, Network } from 'lucide-react'
import { User } from '@/types'
import { Avatar } from './Avatar'

interface Props {
  user: User | null
  onClose: () => void
}

interface RowProps {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}

function Row({ icon, label, value, href }: RowProps) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 p-2 rounded-lg shrink-0"
        style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-slate-200 hover:text-brand-400 transition-colors break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-slate-200 break-words">{value}</p>
        )}
      </div>
    </div>
  )
}

export function UserModal({ user, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    if (user) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [user])

  return (
    <AnimatePresence>
      {user && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal
            aria-label={`Profile of ${user.cn}`}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{
              background: 'rgba(10,10,30,0.95)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header gradient banner */}
            <div
              className="h-32 shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, #4c1d95 0%, #164e63 100%)',
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 70% 50%, rgba(139,92,246,0.6), transparent 60%)',
                }}
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar overlapping banner */}
            <div className="px-6 -mt-10 mb-4 shrink-0">
              <Avatar
                name={user.cn}
                photo={user.photo}
                size={72}
                className="ring-4 ring-[#07071a]"
              />
            </div>

            {/* Identity */}
            <div className="px-6 shrink-0">
              <h2 className="text-xl font-bold text-white leading-tight">{user.cn}</h2>
              {user.title && (
                <p className="text-brand-400 font-medium mt-0.5">{user.title}</p>
              )}
              {user.username && (
                <p className="text-slate-500 text-sm mt-0.5">@{user.username}</p>
              )}
            </div>

            {/* Divider */}
            <div className="mx-6 mt-4 mb-5 h-px shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Details (scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
              <Row
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={user.mail}
                href={`mailto:${user.mail}`}
              />
              <Row
                icon={<Phone className="w-4 h-4" />}
                label="Office phone"
                value={user.phone}
                href={user.phone ? `tel:${user.phone}` : undefined}
              />
              <Row
                icon={<Smartphone className="w-4 h-4" />}
                label="Mobile"
                value={user.mobile}
                href={user.mobile ? `tel:${user.mobile}` : undefined}
              />
              <Row
                icon={<Briefcase className="w-4 h-4" />}
                label="Department"
                value={user.department}
              />
              <Row
                icon={<Building2 className="w-4 h-4" />}
                label="Office"
                value={user.office}
              />
              <Row
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={[user.city, user.country].filter(Boolean).join(', ')}
              />
              <Row
                icon={<UserIcon className="w-4 h-4" />}
                label="Company"
                value={user.company}
              />
              {user.manager && (
                <Row
                  icon={<Network className="w-4 h-4" />}
                  label="Reports to"
                  value={user.manager.split(',')[0]?.replace(/^CN=/i, '') ?? ''}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
