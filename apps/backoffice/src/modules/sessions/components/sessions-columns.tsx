import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Trash2 } from 'lucide-react'
import type { SessionItem } from '../domain/session.domain'

function isSessionActive(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date()
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return '-'

  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)
  const osMatch = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)[\s/]?[\d._]*/i)

  const browser = browserMatch?.[0] ?? 'Navegador desconhecido'
  const os = osMatch?.[0]?.replace(/_/g, '.') ?? ''

  return os ? `${browser} - ${os}` : browser
}

interface SessionColumnsOptions {
  onRevoke: (token: string) => void
  isRevoking: boolean
  currentSessionToken?: string
}

export function getSessionColumns(options: SessionColumnsOptions): ColumnDef<SessionItem>[] {
  const { onRevoke, isRevoking, currentSessionToken } = options

  return [
    {
      accessorKey: 'token',
      header: 'Token',
      cell: ({ row }) => {
        const token = row.getValue<string>('token')
        const isCurrent = token === currentSessionToken
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{token.slice(0, 12)}...</span>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">
                Atual
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'userAgent',
      header: 'Dispositivo',
      cell: ({ row }) => (
        <span className="text-sm">{parseUserAgent(row.getValue<string>('userAgent'))}</span>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue<string>('ipAddress') ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Criada em',
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.getValue<string>('createdAt'))}</span>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Status',
      cell: ({ row }) => {
        const expiresAt = row.getValue<string>('expiresAt')
        const active = isSessionActive(expiresAt)
        return (
          <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Ativa' : 'Expirada'}</Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const token = row.original.token
        const isCurrent = token === currentSessionToken

        if (isCurrent) return null

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(token)}
            disabled={isRevoking}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Revogar
          </Button>
        )
      },
    },
  ]
}
