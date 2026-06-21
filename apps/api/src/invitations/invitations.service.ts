import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(dto: CreateInvitationDto, adminId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new ConflictException('Користувач з таким email вже є в системі');
    }

    const activeInvite = await this.prisma.invitation.findFirst({
      where: { 
        email: dto.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() } 
      },
    });
    if (activeInvite) {
      throw new BadRequestException('Для цього email вже є активне запрошення');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // 4. Зберігаємо в базу
    return this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        role: dto.role,
        invitedById: adminId,
        expiresAt,
      },
    });
  }
}