'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Smartphone, MapPin, Building2, Briefcase, User as UserIcon, Network, Sparkles } from 'lucide-react'
import type { User } from '@/types'
import { Avatar } from './Avatar'
import { UserQAProfile } from '@/components/qa/UserQAProfile'
import { SkillsEditor } from './SkillsEditor'
import { useAuthContext } from '@/context/AuthContext'

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
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f4f7fb] border border-[#e2e8f0]">
      <div
        className="mt-0.5 p-2 rounded-lg shrink-0"
        style={{ background: '#eff6ff', color: '#1b2a4a' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        {href ? (
          <a href={href} className="text-[#1b2a4a] hover:text-[#2563eb] transition-colors break-all font-medium">
            {value}
          </a>
        ) : (
          <p className="text-[#1b2a4a] break-words font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}

export function UserModal({ user, onClose }: Props) {
  const { user: authUser } = useAuthContext()
  const isOwnProfile = !!authUser && !!user && authUser.dn === user.dn

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (user) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [user])

  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(27,42,74,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="panel"
            role="dialog"
            aria-modal
            aria-label={`Profile of ${user.cn}`}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white"
            style={{ borderLeft: '1px solid #e2e8f0', boxShadow: '-8px 0 40px rgba(27,42,74,0.12)' }}
          >
            {/* Profile header banner */}
            <div
              className="shrink-0 relative"
              style={{ background: 'linear-gradient(135deg, #c8ddef 0%, #dbeafe 100%)', paddingBottom: '2.5rem', paddingTop: '2rem' }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-[#1b2a4a]/60 hover:text-[#1b2a4a] hover:bg-[#1b2a4a]/10 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 translate-y-1/2 px-6">
                <Avatar name={user.cn} photo={user.photo} size={72} className="ring-4 ring-white" />
              </div>
            </div>

            <div className="shrink-0" style={{ height: '2.5rem' }} />

            <div className="px-6 shrink-0">
              <h2 className="text-xl font-bold text-[#1b2a4a] leading-tight">{user.cn}</h2>
              {user.title && <p className="text-[#2563eb] font-medium mt-0.5">{user.title}</p>}
              {user.username && <p className="text-slate-400 text-sm mt-0.5">@{user.username}</p>}
            </div>

            <div className="mx-6 mt-4 mb-5 h-px shrink-0 bg-[#e2e8f0]" />

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3">
              <Row icon={<Mail className="w-4 h-4" />}        label="Email"       value={user.mail}       href={`mailto:${user.mail}`} />
              <Row icon={<Phone className="w-4 h-4" />}       label="Office phone" value={user.phone}      href={user.phone ? `tel:${user.phone}` : undefined} />
              <Row icon={<Smartphone className="w-4 h-4" />}  label="Mobile"       value={user.mobile}     href={user.mobile ? `tel:${user.mobile}` : undefined} />
              <Row icon={<Briefcase className="w-4 h-4" />}   label="Department"   value={user.department} />
              <Row icon={<Building2 className="w-4 h-4" />}   label="Office"       value={user.office} />
              <Row icon={<MapPin className="w-4 h-4" />}      label="Location"     value={[user.city, user.country].filter(Boolean).join(', ')} />
              <Row icon={<UserIcon className="w-4 h-4" />}    label="Company"      value={user.company} />
              {user.manager && (
                <Row
                  icon={<Network className="w-4 h-4" />}
                  label="Reports to"
                  value={user.manager.split(',')[0]?.replace(/^CN=/i, '') ?? ''}
                />
              )}

              {/* Skills Section */}
              <div className="pt-2">
                <div className="h-px mb-4 bg-[#e2e8f0]" />
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-semibold text-[#1b2a4a]">Skills & Expertise</span>
                  {isOwnProfile && (
                    <span className="ml-auto text-xs text-slate-400">Your profile — click to edit</span>
                  )}
                </div>
                <SkillsEditor dn={user.dn} editable={isOwnProfile} />
              </div>

              {/* Q&A Activity Section */}
              <div className="pt-2">
                <div className="h-px mb-4 bg-[#e2e8f0]" />
                <UserQAProfile dn={user.dn} cn={user.cn} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
