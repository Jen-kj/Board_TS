import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import type { AuthUser } from './interfaces/auth-user.interface'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { RegisterLocalDto } from './dto/register-local.dto'
import { LoginLocalDto } from './dto/login-local.dto'
import { GoogleAuthGuard } from './guards/google-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    // validate 함수에서 에러가 발생하면 user가 null 또는 false가 됩니다.
    // passport-google-oauth20은 에러 발생 시 req.query.error를 설정하지 않을 수 있으므로,
    // req.user가 없는 경우를 에러로 간주하고 처리합니다.
    if (!user) {
      const errorMessage = '이미 가입된 계정입니다. 로그인으로 다시 시도해주세요.';
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;
      const redirectUrl = this.authService.getFrontendCallbackUrl({ error: errorMessage }, state);
      res.redirect(redirectUrl);
    } else {
      const token = this.authService.signToken(user);
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;
      const redirectUrl = this.authService.getFrontendCallbackUrl({ token }, state);
      res.redirect(redirectUrl);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthUser): AuthUser {
    return user
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() payload: UpdateProfileDto
  ): Promise<{ token: string; user: AuthUser }> {
    return this.authService.updateProfile(user.id, payload)
  }

  @Post('local/register')
  async registerLocal(@Body() payload: RegisterLocalDto): Promise<{ token: string; user: AuthUser }> {
    return this.authService.registerLocalUser(payload)
  }

  @Post('local/login')
  async loginLocal(@Body() payload: LoginLocalDto): Promise<{ token: string; user: AuthUser }> {
    return this.authService.loginLocalUser(payload)
  }
}
