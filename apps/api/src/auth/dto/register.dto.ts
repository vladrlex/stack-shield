import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'Email є обовʼязковим' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
  @IsNotEmpty({ message: 'Пароль є обовʼязковим' })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  token?: string;
}