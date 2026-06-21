import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'Email є обовʼязковим для запрошення' })
  email!: string;

  @IsEnum(Role, { message: 'Вказана некоректна роль' })
  @IsNotEmpty({ message: 'Роль є обовʼязковою' })
  role!: Role;
}