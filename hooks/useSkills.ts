'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = '/api/profile/skills'

export function useSkills(dn: string | undefined) {
  return useQuery<string[]>({
    queryKey: ['skills', dn],
    queryFn:  () => fetch(`${API}?dn=${encodeURIComponent(dn!)}`).then((r) => r.json()),
    enabled:  !!dn,
    staleTime: 60 * 1000,
  })
}

export function useAddSkill(dn: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (skill: string) =>
      fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ skill }),
      }).then((r) => {
        if (!r.ok) throw new Error('Failed to add skill')
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills', dn] })
      qc.invalidateQueries({ queryKey: ['qa', 'experts'] })
    },
  })
}

export function useRemoveSkill(dn: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (skill: string) =>
      fetch(API, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ skill }),
      }).then((r) => {
        if (!r.ok) throw new Error('Failed to remove skill')
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills', dn] })
      qc.invalidateQueries({ queryKey: ['qa', 'experts'] })
    },
  })
}
