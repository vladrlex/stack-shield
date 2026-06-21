import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async register(dto: RegisterDto) {
    const candidate = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (candidate) {
      throw new ConflictException('Користувач з таким email вже зареєстрований');
    }

    let finalRole: 'USER' | 'ADMIN' | 'MEMBER' = 'USER';

    if (dto.token) {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token: dto.token },
      });

      if (!invitation) {
        throw new UnauthorizedException('Невалідний токен запрошення');
      }

      if (invitation.acceptedAt) {
        throw new BadRequestException('Це запрошення вже було використано');
      }

      if (invitation.expiresAt < new Date()) {
        throw new UnauthorizedException('Термін дії запрошення вичерпано');
      }

      if (invitation.email !== dto.email) {
        throw new BadRequestException('Цей токен призначений для іншого email');
      }

      finalRole = invitation.role;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        role: finalRole,
      },
    });

    if (dto.token) {
      await this.prisma.invitation.update({
        where: { token: dto.token },
        data: { acceptedAt: new Date() },
      });
    }

    const { passwordHash, ...result } = newUser;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenString = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Зберігаємо рефреш-сесію в базу даних
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshTokenString,
    };
  }

  async refresh(tokenStr: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: tokenStr },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Невалідний refresh токен');
    }

    if (storedToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Токен вже був використаний! Сесія скомпрометована, залогіньтесь знову');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Термін дії refresh токена вичерпано');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const payload = {
      email: storedToken.user.email,
      sub: storedToken.user.id,
      role: storedToken.user.role
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshTokenString = crypto.randomBytes(40).toString('hex');

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: newRefreshTokenString,
        userId: storedToken.user.id,
        expiresAt: newExpiresAt,
        replacedBy: storedToken.token,
      },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshTokenString,
    };
  }
  async logout(tokenStr: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: tokenStr },
    });

    if (storedToken) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });
    }

    return { message: 'Сесію успішно завершено' };
  }
}