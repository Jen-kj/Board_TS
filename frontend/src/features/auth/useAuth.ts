import { useAuthContext } from './AuthContext'

export function useAuth() {
  return useAuthContext()
}
