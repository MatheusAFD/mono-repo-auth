import { Module } from '@nestjs/common'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { auth } from './auth/auth'
import { AppController } from './app.controller'
import { SessionsModule } from './modules/sessions/sessions.module'

@Module({
  imports: [AuthModule.forRoot({ auth }), SessionsModule],
  controllers: [AppController],
})
export class AppModule {}
