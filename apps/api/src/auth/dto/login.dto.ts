import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password!: string;
}