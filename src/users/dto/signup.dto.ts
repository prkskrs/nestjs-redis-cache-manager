import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'invalid email format' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  role: string;
}
