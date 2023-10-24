import {
  Injectable,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Controller,
  UseGuards,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import { SignupDto } from '../users/dto/signup.dto';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from '../users/dto/updatePassword.dto';
import { UserEmailDto, UserNewPasswordDto } from '../users/dto/userEmail.dto';
import { CustomRequest } from 'src/interfaces';

@Injectable()
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignupDto) {
    try {
      return await this.authService.signUp(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('password/update')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() request: CustomRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const email = request.user.email;
      return await this.authService.changePassword(email, changePasswordDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('homepage')
  @Roles('Admin')
  
  @UseGuards(AuthGuard, RolesGuard)
  async homepage(@Req() request: CustomRequest) {
    try {
      const currentUser = request?.user;
      return await this.authService.homepage(currentUser);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: UserEmailDto) {
    try {
      return await this.authService.forgotPassword(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // @Post('reset-password/:token')
  // async resetPassword(
  //   @Param('token') resetPasswordToken: string,
  //   @Body() userNewPassword: UserNewPasswordDto,
  // ) {
  //   try {
  //     return await this.authService.resetPassword(
  //       resetPasswordToken,
  //       userNewPassword,
  //     );
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
