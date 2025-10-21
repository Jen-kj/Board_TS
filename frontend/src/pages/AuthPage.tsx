import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildGoogleAuthUrl } from '../lib/api'
import { useAuth } from '../features/auth/useAuth'
import './AuthPage.css'

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
  const [isRegisterMode, setIsRegisterMode] = useState(false)
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

  const renderLoginForm = (): JSX.Element => (
    <div className="form-stack">
      <h2>로그인</h2>
      <p>닉네임 또는 아이디로 로그인하고 여행 이야기를 이어가세요.</p>
      <form onSubmit={handleLocalLogin} noValidate>
        <label>
          아이디 또는 이메일
          <input
            type="text"
            value={loginIdentifier}
            onChange={(event) => setLoginIdentifier(event.target.value)}
            placeholder="your-id 또는 email@example.com"
            disabled={loading || loginSubmitting}
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="비밀번호"
            disabled={loading || loginSubmitting}
            autoComplete="current-password"
          />
        </label>
        {loginError ? <p className="error">{loginError}</p> : null}
        <button type="submit" className="primary-button" disabled={loading || loginSubmitting}>
          {loginSubmitting ? '로그인 중...' : '닉네임으로 로그인'}
        </button>
      </form>
      <button type="button" className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
        <span className="text-lg">☁️</span>
        Google 계정으로 계속하기
      </button>
      <p className="helper-text">로그인하면 작성한 글을 언제든지 확인하고 수정할 수 있어요.</p>
    </div>
  )

  const renderRegisterForm = (): JSX.Element => (
    <div className="form-stack">
      <h2>회원가입</h2>
      <p>간단한 정보만 입력하면 RoamLog에서 바로 활동할 수 있어요.</p>
      <form onSubmit={handleRegisterSubmit} noValidate>
        <label>
          닉네임
          <input
            type="text"
            value={registerForm.displayName}
            onChange={(event) => handleRegisterChange('displayName', event.target.value)}
            placeholder="예: 여행러, 감성캠퍼"
            maxLength={40}
            disabled={loading || registerSubmitting}
            autoComplete="nickname"
          />
        </label>
        <label>
          아이디
          <input
            type="text"
            value={registerForm.username}
            onChange={(event) => handleRegisterChange('username', event.target.value)}
            placeholder="영문, 숫자, ._- 조합"
            maxLength={30}
            disabled={loading || registerSubmitting}
            autoComplete="username"
          />
        </label>
        <label>
          이메일
          <input
            type="email"
            value={registerForm.email}
            onChange={(event) => handleRegisterChange('email', event.target.value)}
            placeholder="email@example.com"
            maxLength={100}
            disabled={loading || registerSubmitting}
            autoComplete="email"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={registerForm.password}
            onChange={(event) => handleRegisterChange('password', event.target.value)}
            placeholder="6자 이상 입력"
            maxLength={100}
            disabled={loading || registerSubmitting}
            autoComplete="new-password"
          />
        </label>
        {registerError ? <p className="error">{registerError}</p> : null}
        <button type="submit" className="primary-button" disabled={loading || registerSubmitting}>
          {registerSubmitting ? '가입 중...' : '닉네임으로 가입하기'}
        </button>
      </form>
      <button type="button" className="google-button" onClick={handleGoogleSignIn} disabled={loading}>
        <span className="text-lg">☁️</span>
        Google 계정으로 시작하기
      </button>
      <p className="helper-text">회원가입 후 닉네임으로 글 작성과 댓글 참여가 가능해요.</p>
    </div>
  )

  const renderOverlay = (options: { title: string; description: string; actionLabel: string; onClick: () => void }): JSX.Element => (
    <div className="overlay-content">
      <h2>{options.title}</h2>
      <p>{options.description}</p>
      <button type="button" onClick={options.onClick}>
        {options.actionLabel}
      </button>
    </div>
  )

  return (
    <div className="auth-page-root">
      <div className="auth-card">
        <div className={`auth-pane ${isRegisterMode ? 'overlay-pane' : 'form-pane'}`}>
          {isRegisterMode
            ? renderOverlay({
                title: '다시 만나서 반가워요!',
                description: '이미 계정을 만들었다면 로그인하고 여행 기록을 이어가요.',
                actionLabel: '로그인으로 이동',
                onClick: () => setIsRegisterMode(false),
              })
            : renderLoginForm()}
        </div>
        <div className={`auth-pane ${isRegisterMode ? 'form-pane' : 'overlay-pane'}`}>
          {isRegisterMode
            ? renderRegisterForm()
            : renderOverlay({
                title: 'RoamLog에 오신 걸 환영해요',
                description: '새로운 여행 이야기를 시작해 볼까요? 회원가입을 눌러 주세요.',
                actionLabel: '회원가입하기',
                onClick: () => setIsRegisterMode(true),
              })}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
