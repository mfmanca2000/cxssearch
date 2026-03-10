'use client'
import Image from 'next/image'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="sidebar w-64 lg:w-72 flex-shrink-0 flex flex-col h-full overflow-hidden relative z-10">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[#e2e8f0] shrink-0">
        <Image src="/logo.webp" alt="CSX Logo" width={36} height={36} className="shrink-0" />
        <div>
          <span className="font-semibold text-[#1b2a4a] text-sm">CSX Search</span>
          <p className="text-slate-400 text-xs">People & Q&A</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        <SidebarNav />
      </div>
    </aside>
  )
}
