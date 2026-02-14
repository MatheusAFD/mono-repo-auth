import { Module } from '@nestjs/common'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { auth } from './auth/auth'
import { AppController } from './app.controller'

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [AppController],
})
export class AppModule {}
