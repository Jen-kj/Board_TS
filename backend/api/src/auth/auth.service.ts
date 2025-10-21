import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import type { AuthUser, JwtPayload } from './interfaces/auth-user.interface'

interface GoogleUserInput {
  email: string
  displayName: string
  providerId: string
  avatarUrl?: string
}

@Injectable()
export class AuthService {
  private readonly frontendUrl: string

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService
  ) {
    this.frontendUrl = configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'
  }

  getFrontendCallbackUrl(token: string, state?: string | null): string {
    const url = new URL('/auth/callback', this.frontendUrl)
    url.searchParams.set('token', token)
    if (state) {
      url.searchParams.set('state', state)
    }
    return url.toString()
  }

  async validateGoogleUser(input: GoogleUserInput): Promise<AuthUser> {
    const userDoc = await this.usersService.upsertGoogleUser({
      email: input.email,
      displayName: input.displayName,
      providerId: input.providerId,
      avatarUrl: input.avatarUrl,
    })

    return {
      id: userDoc.id,
      email: userDoc.email,
      displayName: userDoc.displayName,
      avatarUrl: userDoc.avatarUrl ?? null,
    }
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
    }
    return this.jwtService.sign(payload)
  }
}
