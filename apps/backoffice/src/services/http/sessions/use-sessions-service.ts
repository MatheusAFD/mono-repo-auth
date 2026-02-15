import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionsService } from '.'

export const sessionsQueryKey = 'sessions' as const

export function useSessions() {
  return useQuery({
    queryKey: [sessionsQueryKey],
    queryFn: async () => {
      const [error, result] = await sessionsService.listSessions()

      if (error || !result) {
        throw error || new Error('Failed to fetch sessions')
      }

      return result
    },
    refetchOnWindowFocus: true,
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const [error, result] = await sessionsService.revokeSession(token)

      if (error || !result) {
        throw error || new Error('Failed to revoke session')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [sessionsQueryKey] })
    },
  })
}
