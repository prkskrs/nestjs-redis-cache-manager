import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../users/dto/signup.dto';
import { User } from '../users/users.schema';
import { LoginDto } from '../users/dto/login.dto';
import {
  LoginInterface,
  SignUpInterface,
  AuthResponse,
} from '../interfaces/index';
import { JwtPayload } from '../types';
import { EmailService } from '../services/email.service';
import { ChangePasswordDto } from '../users/dto/updatePassword.dto';
import { UserEmailDto, UserNewPasswordDto } from 'src/users/dto/userEmail.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(payload: JwtPayload) {
    return await this.usersService.findOneById(payload.id);
  }

  generateJwtToken(user: User) {
    const payload = { id: user._id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  async signUp(body: SignupDto): Promise<SignUpInterface> {
    const { email, password, role } = body;
    const existingUser = await this.usersService.findOneByEmail(email);

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const newUser = await this.usersService.create({
      email,
      password,
      role,
    });
    const token = this.generateJwtToken(newUser);
    return {
      message: 'User Registered Successfully!',
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginInterface | never> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid Credentials');
    }

    const token = this.generateJwtToken(user);

    return {
      message: 'LoggedIn Successfully!',
      token,
      data: user,
    };
  }

  async changePassword(
    email: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<AuthResponse | never> {
    const user = await this.usersService.findOneByEmail(email);
    const isPasswordCorrect = await this.usersService.comparePasswords(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new NotFoundException('Invalid credentials');
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new Error('new password should not be same as old password');
    }
    const hashedPassword = await this.usersService.hashPassword(
      changePasswordDto.newPassword,
    );
    user.password = hashedPassword;
    await user.save();
    return {
      message: `password updated successfully`,
    };
  }

  async forgotPassword(body: UserEmailDto): Promise<AuthResponse | never> {
    const { email } = body;
    const isExistUser = await this.usersService.findOneByEmail(email);

    if (!isExistUser) {
      throw new NotFoundException('User not found');
    }

    const forgotToken = crypto.randomBytes(20).toString('hex');
    const encryptedToken = await this.tokenEncryption(forgotToken);
    isExistUser.forgotPasswordToken = encryptedToken;
    isExistUser.forgotPasswordExpiry = new Date(Date.now() + 5 * 60 * 1000); // 20 mins to expire the token for password reset
    await isExistUser.save();

    // send email to reset password
    this.emailService.sendEmail({
      email: isExistUser.email,
      subject: 'link for resetting password',
      message: `please click on <a href="http://localhost:9000/auth/reset-password/${forgotToken}>this link</a> to reset your password`,
    });

    return {
      message: 'reset link sent successfully to the registered email',
    };
  }

  // async resetPassword(
  //   token: string,
  //   userNewPassword: UserNewPasswordDto,
  // ): Promise<AuthResponse | never> {
  //   const forgotPasswordToken = await this.tokenEncryption(token);
  //   const property = 'forgotPasswordToken';
  //   const isExistUser = await this.usersService.fi(
  //     property,
  //     forgotPasswordToken,
  //     { forgotPasswordExpiry: { $gt: Date.now() } },
  //   );

  //   // if user is not found or resetPassword link is expired
  //   if (!isExistUser) {
  //     throw new NotFoundException('user not found or reset link expired');
  //   }

  //   const { password } = userNewPassword;
  //   const hashedPassword = await this.usersService.hashPassword(password);
  //   isExistUser.password = hashedPassword;

  //   isExistUser.forgotPasswordToken = undefined;
  //   isExistUser.forgotPasswordExpiry = undefined;

  //   await isExistUser.save();

  //   return {
  //     message: 'password reset done successfully',
  //   };
  // }

  async homepage(user: object) {
    return {
      message: 'Congrats! You have hacked my prkskrs private page!',
    };
  }

  async tokenEncryption(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
