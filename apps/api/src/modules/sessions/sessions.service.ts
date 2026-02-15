import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { desc, eq, gt } from 'drizzle-orm'
import { db } from '../../config/database'
import { session as sessionTable, user as userTable } from '../../config/database/schema'

@Injectable()
export class SessionsService {
  async listSessions() {
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(gt(sessionTable.expiresAt, new Date()))
      .orderBy(desc(sessionTable.createdAt))

    return sessions
  }

  async revokeSession(token: string) {
    const [target] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, token))

    if (!target) {
      throw new NotFoundException('Session not found')
    }

    const [targetUser] = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, target.userId))

    if (targetUser?.role === 'backoffice') {
      throw new ForbiddenException('Cannot revoke session of another admin')
    }

    await db.delete(sessionTable).where(eq(sessionTable.token, token))

    return { success: true }
  }
}
