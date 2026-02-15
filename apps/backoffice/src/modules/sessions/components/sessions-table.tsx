import { authClient } from '@/lib/auth-client'
import { useRevokeSession, useSessions } from '@/services/http/sessions/use-sessions-service'
import { getSessionColumns } from './sessions-columns'
import { SessionsDataTable } from './sessions-data-table'

export function SessionsTable() {
  const { data: sessions, isLoading, error } = useSessions()
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()
  const { data: currentSession } = authClient.useSession()

  const columns = getSessionColumns({
    onRevoke: (token) => revokeSession(token),
    isRevoking,
    currentSessionToken: currentSession?.session.token,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando sessões...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-600">Erro ao carregar sessões: {error.message}</p>
      </div>
    )
  }

  return <SessionsDataTable columns={columns} data={sessions ?? []} />
}
