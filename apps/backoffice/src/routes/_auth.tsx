import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  server: {
    middleware: [authMiddleware],
  },
})

function AuthLayout() {
  return <Outlet />
}
