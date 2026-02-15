import { env } from '@/env'
import { httpHttpClientFactory } from '@/services/factories/http-client-factory'
import { SessionsService } from './sessions-service'

const sessionsApiClient = httpHttpClientFactory(env.VITE_API_URL)

export const sessionsService = new SessionsService(sessionsApiClient)
