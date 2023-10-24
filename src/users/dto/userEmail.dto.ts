import { IsEmail, MinLength } from 'class-validator';

export class UserEmailDto {
  @IsEmail({}, { message: 'invalid email format' })
  email: string;
}

export class UserNewPasswordDto {
  @MinLength(6)
  password: string;
}
