'use client'
import { useState } from 'react'
import Image from 'next/image'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="sidebar flex-shrink-0 flex flex-col h-full overflow-hidden relative z-10 transition-all duration-200"
      style={{ width: collapsed ? '3.5rem' : '13rem' }}
    >
      {/* Logo + toggle */}
      <div className="px-3 py-4 flex items-center border-b border-[#e2e8f0] shrink-0 min-w-0">
        {!collapsed && (
          <>
            <Image src="/logo.webp" alt="CSX Logo" width={32} height={32} className="shrink-0" />
            <div className="ml-2.5 flex-1 min-w-0">
              <span className="font-semibold text-[#1b2a4a] text-sm block truncate">CSX Search</span>
              <p className="text-slate-400 text-xs truncate">People & Q&A</p>
            </div>
          </>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-[#1b2a4a] hover:bg-slate-100 transition-colors"
          style={{ marginLeft: collapsed ? 'auto' : '0.25rem' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen  className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  )
}
