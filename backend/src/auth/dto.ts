import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  login!: string;

  @IsNotEmpty()
  password!: string;
}

export class ChangePasswordDto {
  @MinLength(6)
  newPassword!: string;
}
