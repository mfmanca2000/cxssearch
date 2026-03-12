'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Question, Answer, Expert, UserQAProfile, TagStat } from '@/types'

const API = '/api/qa'

// ─── Questions ────────────────────────────────────────────────────────────────

export function useQuestions(params?: { tag?: string; status?: string; page?: number; sort?: 'newest' | 'votes' | 'active' }) {
  const search = new URLSearchParams()
  if (params?.tag)    search.set('tag',    params.tag)
  if (params?.status) search.set('status', params.status)
  if (params?.page)   search.set('page',   String(params.page))
  if (params?.sort)   search.set('sort',   params.sort)

  return useQuery<Question[]>({
    queryKey: ['qa', 'questions', params],
    queryFn:  async () => {
      const r = await fetch(`${API}/questions?${search}`)
      if (!r.ok) throw new Error(`Failed to load questions (${r.status})`)
      return r.json()
    },
    staleTime: 0,
  })
}

export function useQuestion(id: number | string | undefined) {
  return useQuery<Question>({
    queryKey: ['qa', 'question', id],
    queryFn:  () => fetch(`${API}/questions/${id}`).then((r) => r.json()),
    enabled:  !!id,
  })
}

export function useSimilarQuestions(title: string) {
  return useQuery<Array<{ id: number; title: string; status: string }>>({
    queryKey: ['qa', 'similar', title],
    queryFn:  () => fetch(`${API}/questions/similar?title=${encodeURIComponent(title)}`).then((r) => r.json()),
    enabled:  title.trim().length >= 5,
  })
}

// ─── Answers ─────────────────────────────────────────────────────────────────

export function useAnswers(questionId: number | string | undefined) {
  return useQuery<Answer[]>({
    queryKey: ['qa', 'answers', questionId],
    queryFn:  () => fetch(`${API}/questions/${questionId}/answers`).then((r) => r.json()),
    enabled:  !!questionId,
  })
}

// ─── Experts ─────────────────────────────────────────────────────────────────

export function useExperts(params?: { tag?: string; dept?: string; q?: string }) {
  const search = new URLSearchParams()
  if (params?.tag)  search.set('tag',  params.tag)
  if (params?.dept) search.set('dept', params.dept)
  if (params?.q)    search.set('q',    params.q)
  const qs = search.toString()
  const url = qs ? `${API}/experts?${qs}` : `${API}/experts`

  return useQuery<Expert[]>({
    queryKey: ['qa', 'experts', params],
    queryFn:  () => fetch(url).then((r) => r.json()),
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function useTags() {
  return useQuery<TagStat[]>({
    queryKey: ['qa', 'tags'],
    queryFn:  () => fetch(`${API}/tags`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Inbox (directed questions) ───────────────────────────────────────────────

export interface InboxItem extends Question {
  notified_at: string | null
}

export interface InboxData {
  personal: { questions: InboxItem[]; unread: number }
  team:     { questions: InboxItem[]; unread: number; teamOu?: string }
}

const INBOX_INIT: InboxData = {
  personal: { questions: [], unread: 0 },
  team:     { questions: [], unread: 0 },
}

export function useInbox() {
  return useQuery<InboxData>({
    queryKey:        ['qa', 'inbox'],
    queryFn:         () => fetch('/api/qa/inbox').then((r) => r.json()),
    staleTime:       30 * 1000,
    refetchInterval: 60 * 1000,
    initialData:     INBOX_INIT,
  })
}

export function useMarkInboxRead(scope: 'personal' | 'team') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetch(`/api/qa/inbox?scope=${scope}`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', 'inbox'] }),
  })
}

// ─── User Q&A profile ────────────────────────────────────────────────────────

export function useUserQAProfile(dn: string | undefined) {
  return useQuery<UserQAProfile>({
    queryKey: ['qa', 'profile', dn],
    queryFn:  () =>
      fetch(`${API}/profile/${encodeURIComponent(dn!)}`).then((r) => r.json()),
    enabled:  !!dn,
    staleTime: 2 * 60 * 1000,
  })
}
