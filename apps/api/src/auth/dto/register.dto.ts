import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'Email не може бути порожнім' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Ім'я не може бути порожнім" })
  name!: string; 
}