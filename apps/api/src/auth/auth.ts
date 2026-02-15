import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '../config/database'
import * as schema from '../config/database/schema'
import { ac, portalRole, backofficeRole } from './permissions'

export const auth = betterAuth({
  appName: 'Mono Repo Auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      ac,
      roles: {
        portal: portalRole,
        backoffice: backofficeRole,
      },
      defaultRole: 'portal',
    }),
  ],
})
