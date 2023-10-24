import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return await this.appService.getHello();
  }

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Get('/admin')
  adminAccessibleApi() {
    return this.appService.adminAccessibleApi();
  }

  @Roles('client')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Get('/client')
  clientAccessibleApi() {
    return this.appService.clientAccessibleApi();
  }
}
