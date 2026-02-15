import type { RevokeSessionResponse, SessionItem } from '@/modules/sessions/domain/session.domain'
import type { HttpClient } from '@/types/http'

export type ISessionsService = {
  listSessions(): Promise<[Error | null, SessionItem[] | null]>
  revokeSession(token: string): Promise<[Error | null, RevokeSessionResponse | null]>
}

export class SessionsService implements ISessionsService {
  constructor(readonly httpClient: HttpClient) {}

  async listSessions(): Promise<[Error | null, SessionItem[] | null]> {
    const [error, response] = await this.httpClient.request<SessionItem[]>({
      url: '/sessions',
      method: 'GET',
    })

    if (error || !response) {
      return [error, null]
    }

    return [null, response.data]
  }

  async revokeSession(token: string): Promise<[Error | null, RevokeSessionResponse | null]> {
    const [error, response] = await this.httpClient.request<RevokeSessionResponse>({
      url: `/sessions/${token}`,
      method: 'DELETE',
    })

    if (error || !response) {
      return [error, null]
    }

    return [null, response.data]
  }
}
