import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import type { AuthUser } from '../interfaces/auth-user.interface'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthUser> {
    const emails = profile.emails ?? []
    const primaryEmail = emails.find((item) => item.verified) ?? emails[0]

    if (!primaryEmail?.value) {
      throw new UnauthorizedException('Google 계정에서 이메일 정보를 가져오지 못했어요.')
    }

    const displayName = profile.displayName || primaryEmail.value
    const avatarUrl = profile.photos?.[0]?.value

    return this.authService.validateGoogleUser({
      email: primaryEmail.value,
      displayName,
      providerId: profile.id,
      avatarUrl,
    })
  }
}
