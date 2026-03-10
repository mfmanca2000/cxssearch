'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, FolderOpen, Folder, Globe } from 'lucide-react'
import type { OrgNode } from '@/types'

interface NodeProps {
  node: OrgNode
  depth: number
  selected: string
  onSelect: (dn: string) => void
}

function containsSelected(n: OrgNode, selected: string): boolean {
  return n.dn === selected || n.children.some((c) => containsSelected(c, selected))
}

function TreeNode({ node, depth, selected, onSelect }: NodeProps) {
  const isSelected  = selected === node.dn
  const hasChildren = node.children.length > 0
  const [open, setOpen] = useState(() => depth < 2 || containsSelected(node, selected))

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen((v) => !v)
  }

  return (
    <li>
      <button
        onClick={() => onSelect(node.dn)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-150 group"
        style={
          isSelected
            ? { background: '#eff6ff', color: '#1b2a4a', fontWeight: 600 }
            : { color: '#64748b' }
        }
      >
        <span style={{ width: depth * 12 }} aria-hidden />

        {hasChildren ? (
          <span
            onClick={toggleOpen}
            className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
            role="button"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'block' }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.span>
          </span>
        ) : (
          <span className="w-5 shrink-0" aria-hidden />
        )}

        <span className="shrink-0" style={{ color: isSelected ? '#2563eb' : undefined }}>
          {depth === 0 ? (
            <Globe className="w-3.5 h-3.5" />
          ) : open && hasChildren ? (
            <FolderOpen className="w-3.5 h-3.5" />
          ) : (
            <Folder className="w-3.5 h-3.5" />
          )}
        </span>

        <span
          className="truncate text-sm transition-colors group-hover:text-[#1b2a4a]"
          style={{ fontWeight: isSelected ? 600 : 400 }}
        >
          {node.name}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.dn}
                node={child}
                depth={depth + 1}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

interface Props {
  tree: OrgNode | null
  selected: string
  onSelect: (dn: string) => void
  loading: boolean
}

export function OrgTreePanel({ tree, selected, onSelect, loading }: Props) {
  return (
    <nav className="flex flex-col h-full bg-white" aria-label="Organisation tree">
      <div className="px-3 py-4 shrink-0 border-b border-[#e2e8f0]">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Browse branch
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {loading && (
          <div className="space-y-2 px-2 py-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-lg animate-pulse bg-slate-100"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
        )}

        {!loading && tree && (
          <ul role="tree">
            <TreeNode node={tree} depth={0} selected={selected} onSelect={onSelect} />
          </ul>
        )}
      </div>
    </nav>
  )
}
