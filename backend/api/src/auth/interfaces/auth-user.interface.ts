export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
}

export interface JwtPayload {
  sub: string
  email: string
  displayName: string
  avatarUrl?: string | null
  iat?: number
  exp?: number
}
