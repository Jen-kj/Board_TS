export type AuthProvider = 'google' | 'local'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  requiresProfileSetup: boolean
  googleDisplayName?: string | null
  username?: string | null
  provider: AuthProvider
}

export interface JwtPayload {
  sub: string
  email: string
  displayName: string
  avatarUrl?: string | null
  requiresProfileSetup: boolean
  googleDisplayName?: string | null
  username?: string | null
  provider: AuthProvider
  iat?: number
  exp?: number
}
