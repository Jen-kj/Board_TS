import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthenticatedUser } from '../../lib/api'
import { fetchCurrentUser } from '../../lib/api'

const STORAGE_KEY = 'board.auth.token'
const REDIRECT_STORAGE_KEY = 'board.auth.redirect'

type AuthContextValue = {
  user: AuthenticatedUser | null
  token: string | null
  loading: boolean
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
  setPendingRedirect: (path: string | null) => void
  pendingRedirect: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState<boolean>(!!token)
  const [pendingRedirect, setPendingRedirectState] = useState<string | null>(
    () => sessionStorage.getItem(REDIRECT_STORAGE_KEY)
  )

  const setPendingRedirect = useCallback((path: string | null) => {
    if (path) {
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, path)
    } else {
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
    }
    setPendingRedirectState(path)
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchCurrentUser(token)
      .then((profile) => {
        if (cancelled) {
          return
        }
        setUser(profile)
      })
      .catch((error) => {
        console.error(error)
        if (cancelled) {
          return
        }
        clearSession()
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, clearSession])

  const loginWithToken = useCallback(async (nextToken: string) => {
    localStorage.setItem(STORAGE_KEY, nextToken)
    setToken(nextToken)
    setLoading(true)
    try {
      const profile = await fetchCurrentUser(nextToken)
      setUser(profile)
    } catch (error) {
      console.error(error)
      clearSession()
      throw error
    } finally {
      setLoading(false)
    }
  }, [clearSession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      loginWithToken,
      logout,
      pendingRedirect,
      setPendingRedirect,
    }),
    [user, token, loading, loginWithToken, logout, pendingRedirect, setPendingRedirect]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}
