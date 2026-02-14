import { createAuthClient } from 'better-auth/react'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '@repo/auth/types'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
})
