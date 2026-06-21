import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'; // Додали ConflictException
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        role: 'USER',
      },
    });

    const { passwordHash, ...result } = newUser;
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}