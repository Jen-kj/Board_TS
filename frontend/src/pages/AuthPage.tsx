import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildGoogleAuthUrl } from '../lib/api'
import { useAuth } from '../features/auth/useAuth'

type PanelMode = 'login' | 'register'

type RegisterFormState = {
  username: string
  password: string
  displayName: string
  email: string
}

function AuthPage(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    user,
    loading,
    setPendingRedirect,
    pendingRedirect,
    loginLocal,
    registerLocal,
  } = useAuth()
  const [mode, setMode] = useState<PanelMode>('login')
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    username: '',
    password: '',
    displayName: '',
    email: '',
  })
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSubmitting, setRegisterSubmitting] = useState(false)

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const nextPath = useMemo(() => {
    const target = searchParams.get('next')
    if (target && target.startsWith('/')) {
      return target
    }
    return '/'
  }, [searchParams])

  useEffect(() => {
    if (!loading && user) {
      const target =
        pendingRedirect && pendingRedirect !== '/auth/setup' ? pendingRedirect : nextPath
      navigate(target, { replace: true })
    }
  }, [user, loading, nextPath, navigate, pendingRedirect])

  const handleGoogleSignIn = (): void => {
    setPendingRedirect(nextPath)
    const state = encodeURIComponent(nextPath)
    window.location.href = buildGoogleAuthUrl(state)
  }

  const handleLocalLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const identifier = loginIdentifier.trim()
    const password = loginPassword

    if (!identifier) {
      setLoginError('아이디 또는 이메일을 입력해 주세요.')
      return
    }
    if (!password) {
      setLoginError('비밀번호를 입력해 주세요.')
      return
    }

    setLoginError(null)
    setLoginSubmitting(true)
    try {
      setPendingRedirect(nextPath)
      await loginLocal({ identifier, password })
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setLoginSubmitting(false)
    }
  }

  const handleRegisterChange = (key: keyof RegisterFormState, value: string): void => {
    setRegisterForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const trimmedUsername = registerForm.username.trim()
    const trimmedDisplayName = registerForm.displayName.trim()
    const trimmedEmail = registerForm.email.trim()
    const password = registerForm.password

    if (!trimmedDisplayName) {
      setRegisterError('닉네임을 입력해 주세요.')
      return
    }
    if (!trimmedUsername) {
      setRegisterError('아이디를 입력해 주세요.')
      return
    }
    if (!trimmedEmail) {
      setRegisterError('이메일을 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setRegisterError('비밀번호는 6자 이상 입력해 주세요.')
      return
    }

    setRegisterError(null)
    setRegisterSubmitting(true)
    try {
      setPendingRedirect(nextPath)
      await registerLocal({
        username: trimmedUsername,
        password,
        displayName: trimmedDisplayName,
        email: trimmedEmail,
      })
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : '회원가입에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setRegisterSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6ff] px-4 py-10 text-[#1f2f5f]">
      <div className="relative flex w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_34px_70px_-40px_rgba(31,47,95,0.35)]">
        <div
          className={`relative flex w-1/2 min-h-[560px] flex-col items-center justify-center gap-6 p-10 transition-all duration-500 ${
            isLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
          onMouseEnter={() => setMode('login')}
        >
          <div className="absolute inset-0 w-full bg-gradient-to-br from-[#1f2f5f] via-[#238fad] to-[#59c3c3]" />
          <div className="relative flex w-full flex-col gap-6 text-white">
            <div className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
              Welcome Back!
            </div>
            <h1 className="text-3xl font-bold">닉네임으로 로그인하거나 Google 계정을 사용해요</h1>
            <p className="text-sm leading-relaxed text-white/80">
              한 번 가입해 두면 언제든지 여행 기록을 작성하고 관리할 수 있어요.
            </p>

            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  아이디 또는 이메일
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(event) => setLoginIdentifier(event.target.value)}
                    className="mt-2 w-full rounded-full border border-white/60 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:bg-white focus:text-[#1f2f5f] focus:outline-none focus:ring-2 focus:ring-[#59c3c3]"
                    placeholder="your-id 또는 email@example.com"
                    disabled={loading || loginSubmitting}
                    autoComplete="username"
                  />
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  비밀번호
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="mt-2 w-full rounded-full border border-white/60 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:bg-white focus:text-[#1f2f5f] focus:outline-none focus:ring-2 focus:ring-[#59c3c3]"
                    placeholder="비밀번호"
                    disabled={loading || loginSubmitting}
                    autoComplete="current-password"
                  />
                </label>
              </div>
              {loginError ? <p className="text-xs text-red-200">{loginError}</p> : null}
              <button
                type="submit"
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading || loginSubmitting}
              >
                {loginSubmitting ? '로그인 중...' : '닉네임으로 로그인'}
              </button>
            </form>

            <div className="flex items-center gap-4 text-xs text-white/70">
              <span className="flex-1 border-t border-white/40" />
              <span>또는</span>
              <span className="flex-1 border-t border-white/40" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-3 rounded-full border border-white bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-[#1f2f5f]"
              disabled={loading}
            >
              <span className="text-lg">☁️</span>
              Google로 로그인
            </button>
          </div>
        </div>

        <div
          className={`ml-auto flex w-1/2 min-h-[560px] flex-col justify-center gap-6 p-12 transition-opacity duration-500 ${
            isLogin ? 'opacity-100' : 'opacity-100'
          }`}
          onMouseEnter={() => setMode('register')}
        >
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
            Create Account
          </div>
          <h2 className="text-3xl font-bold text-[#1f2f5f]">
            <span className="block">RoamLog 회원가입</span>
            <span className="block text-lg text-[#4e6e8e]">닉네임, 아이디, 이메일을 설정해 주세요.</span>
          </h2>
          <p className="text-sm text-[#4e6e8e]">
            닉네임으로 바로 활동하거나 Google 계정으로 간편하게 시작할 수도 있어요.
          </p>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 rounded-3xl border border-[#bad7f2]/60 bg-white/95 p-6 shadow-[0_20px_60px_-48px_rgba(31,47,95,0.4)]">
            <div className="grid gap-4">
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
                닉네임
                <input
                  type="text"
                  value={registerForm.displayName}
                  onChange={(event) => handleRegisterChange('displayName', event.target.value)}
                  className="mt-2 w-full rounded-full border border-[#bad7f2]/60 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#59c3c3] focus:ring-2 focus:ring-[#59c3c3]/30"
                  placeholder="예: 여행러, 감성캠퍼"
                  maxLength={40}
                  disabled={loading || registerSubmitting}
                  autoComplete="nickname"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
                아이디
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(event) => handleRegisterChange('username', event.target.value)}
                  className="mt-2 w-full rounded-full border border-[#bad7f2]/60 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#59c3c3] focus:ring-2 focus:ring-[#59c3c3]/30"
                  placeholder="영문, 숫자, ._- 조합"
                  maxLength={30}
                  disabled={loading || registerSubmitting}
                  autoComplete="username"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
                이메일
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => handleRegisterChange('email', event.target.value)}
                  className="mt-2 w-full rounded-full border border-[#bad7f2]/60 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#59c3c3] focus:ring-2 focus:ring-[#59c3c3]/30"
                  placeholder="email@example.com"
                  maxLength={100}
                  disabled={loading || registerSubmitting}
                  autoComplete="email"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
                비밀번호
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => handleRegisterChange('password', event.target.value)}
                  className="mt-2 w-full rounded-full border border-[#bad7f2]/60 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#59c3c3] focus:ring-2 focus:ring-[#59c3c3]/30"
                  placeholder="6자 이상 입력"
                  maxLength={100}
                  disabled={loading || registerSubmitting}
                  autoComplete="new-password"
                />
              </label>
            </div>

            {registerError ? <p className="text-xs text-red-500">{registerError}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[#59c3c3] px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#46b1b1] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || registerSubmitting}
            >
              {registerSubmitting ? '가입 중...' : '닉네임으로 가입하기'}
            </button>
          </form>

          <div className="space-y-3 rounded-3xl border border-dashed border-[#bad7f2]/60 bg-white/70 p-6 text-sm text-[#4e6e8e]">
            <p>또는 Google 계정으로 바로 시작할 수도 있어요.</p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#59c3c3] px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#46b1b1]"
              disabled={loading}
            >
              <span className="text-lg">☁️</span>
              Google 시작하기
            </button>
          </div>

          <div className="text-xs text-[#7ea6cb]">
            <p>로그인이 필요 없는 읽기 전용 이용도 가능합니다.</p>
            <p className="mt-1">글 작성/수정/삭제 시에는 꼭 로그인한 사용자만 가능해요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
