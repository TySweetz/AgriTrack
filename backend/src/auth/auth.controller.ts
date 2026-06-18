<<<<<<< Updated upstream
import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
=======
import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
>>>>>>> Stashed changes
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateMe(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/role')
  switchRole(@Request() req: any, @Body() dto: SwitchRoleDto) {
    return this.authService.switchRole(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }
<<<<<<< Updated upstream
=======

  @Get('vendeurs/:id/public')
  getPublicVendeur(@Param('id') id: string) {
    return this.authService.getPublicVendeur(id);
  }
>>>>>>> Stashed changes
}
