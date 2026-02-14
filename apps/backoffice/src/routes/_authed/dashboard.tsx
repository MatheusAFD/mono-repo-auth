import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@repo/ui/components/button'
import { authClient } from '@/lib/auth-client'
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: session } = authClient.useSession()
  const { signOut } = useAuthActions()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Backoffice</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-red-600 hover:text-red-700"
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back, {session?.user.name ?? session?.user.email}</p>
      </main>
    </div>
  )
}
