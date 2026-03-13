'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, MessageSquare, HelpCircle, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useInbox } from '@/hooks/useQA'

const NAV_ITEMS = [
  { href: '/',       icon: Users,         label: 'People Search' },
  { href: '/qa',     icon: MessageSquare, label: 'Q&A Forum' },
  { href: '/qa/ask', icon: HelpCircle,    label: 'Ask a Question' },
]

interface Props {
  collapsed?: boolean
}

export function SidebarNav({ collapsed = false }: Props) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { data: inbox } = useInbox()
  const unread = (inbox?.personal.unread ?? 0) + (inbox?.team.unread ?? 0)

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 py-2 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = (href === '/' || href === '/qa')
            ? pathname === href
            : pathname.startsWith(href)
          const showBadge = href === '/qa' && unread > 0

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center rounded-xl text-sm transition-all duration-150 relative"
              style={{
                gap:        collapsed ? 0 : '0.75rem',
                padding:    collapsed ? '0.625rem' : '0.625rem 0.75rem',
                justifyContent: collapsed ? 'center' : undefined,
                ...(active
                  ? { background: '#1b2a4a', color: '#ffffff', fontWeight: 600 }
                  : { color: '#64748b' }),
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate flex-1">{label}</span>}
              {showBadge && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none"
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    position: collapsed ? 'absolute' : undefined,
                    top:      collapsed ? '4px'       : undefined,
                    right:    collapsed ? '4px'       : undefined,
                    minWidth: collapsed ? '1rem'      : undefined,
                    fontSize: collapsed ? '0.6rem'    : undefined,
                    padding:  collapsed ? '1px 3px'   : undefined,
                  }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div
          className="mt-auto py-4 border-t border-[#e2e8f0]"
          style={{ padding: collapsed ? '1rem 0' : undefined }}
        >
          {collapsed ? (
            /* Collapsed: avatar links to settings + sign-out icon */
            <div className="flex flex-col items-center gap-3">
              <Link href="/settings" title="Settings">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 hover:opacity-80 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#1b2a4a,#2563eb)' }}
                  title={user.cn}
                >
                  {user.cn.charAt(0)}
                </div>
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                className="text-slate-400 hover:text-[#1b2a4a] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="px-3">
              <Link
                href="/settings"
                className="flex items-center gap-2 mb-3 rounded-lg p-1 -m-1 hover:bg-slate-100 transition-colors group"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#1b2a4a,#2563eb)' }}
                >
                  {user.cn.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1b2a4a] truncate">{user.cn}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
                <Settings className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#1b2a4a] transition-colors w-full"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
