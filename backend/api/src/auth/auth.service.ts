import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import type { AuthUser, JwtPayload } from './interfaces/auth-user.interface'
import { UpdateProfileDto } from './dto/update-profile.dto'
import type { UserDocument } from '../users/schemas/user.schema'
import { RegisterLocalDto } from './dto/register-local.dto'
import { LoginLocalDto } from './dto/login-local.dto'

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

  private toAuthUser(userDoc: UserDocument): AuthUser {
    return {
      id: userDoc.id,
      email: userDoc.email,
      displayName: userDoc.displayName ?? '',
      avatarUrl: userDoc.avatarUrl ?? null,
      requiresProfileSetup: userDoc.requiresProfileSetup ?? false,
      googleDisplayName: userDoc.googleDisplayName ?? null,
      username: userDoc.username ?? null,
      provider: userDoc.provider,
    }
  }

  private buildAuthResponse(userDoc: UserDocument): { token: string; user: AuthUser } {
    const authUser = this.toAuthUser(userDoc)
    const token = this.signToken(authUser)
    return { token, user: authUser }
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

    return this.toAuthUser(userDoc)
  }

  async registerLocalUser(payload: RegisterLocalDto): Promise<{ token: string; user: AuthUser }> {
    const normalizedEmail = payload.email.trim().toLowerCase()
    const normalizedUsername = payload.username.trim().toLowerCase()

    const [existingEmail, existingUsername] = await Promise.all([
      this.usersService.findByEmail(normalizedEmail),
      this.usersService.findByUsername(normalizedUsername),
    ])

    if (existingUsername) {
      throw new BadRequestException('이미 사용 중인 아이디예요.')
    }

    if (existingEmail) {
      throw new BadRequestException('이미 가입된 이메일이에요.')
    }

    const passwordHash = await bcrypt.hash(payload.password, 12)
    const userDoc = await this.usersService.createLocalUser({
      email: normalizedEmail,
      username: normalizedUsername,
      displayName: payload.displayName,
      passwordHash,
    })

    return this.buildAuthResponse(userDoc)
  }

  async loginLocalUser(payload: LoginLocalDto): Promise<{ token: string; user: AuthUser }> {
    const identifier = payload.identifier.trim().toLowerCase()
    const userDoc = await this.usersService.findLocalByIdentifier(identifier)

    if (!userDoc || !userDoc.passwordHash) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않아요.')
    }

    const passwordMatches = await bcrypt.compare(payload.password, userDoc.passwordHash)
    if (!passwordMatches) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않아요.')
    }

    return this.buildAuthResponse(userDoc)
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
      requiresProfileSetup: user.requiresProfileSetup,
      googleDisplayName: user.googleDisplayName ?? null,
      username: user.username ?? null,
      provider: user.provider,
    }
    return this.jwtService.sign(payload)
  }

  async updateProfile(userId: string, payload: UpdateProfileDto): Promise<{ token: string; user: AuthUser }> {
    const updated = await this.usersService.updateProfile(userId, payload.displayName)
    return this.buildAuthResponse(updated)
  }
}

