export interface SessionItem {
  id: string
  token: string
  userId: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress?: string
  userAgent?: string
}

export interface ListSessionsResponse {
  sessions: SessionItem[]
}

export interface RevokeSessionResponse {
  success: boolean
}
