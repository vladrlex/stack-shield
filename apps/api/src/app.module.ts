import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [PrismaModule, AuthModule, InvitationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}