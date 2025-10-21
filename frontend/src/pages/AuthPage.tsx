import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildGoogleAuthUrl } from '../lib/api'
import { useAuth } from '../features/auth/useAuth'

type PanelMode = 'login' | 'register'

function AuthPage(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, setPendingRedirect } = useAuth()
  const [mode, setMode] = useState<PanelMode>('login')

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
      navigate(nextPath, { replace: true })
    }
  }, [user, loading, nextPath, navigate])

  const handleGoogleSignIn = (): void => {
    setPendingRedirect(nextPath)
    const state = encodeURIComponent(nextPath)
    window.location.href = buildGoogleAuthUrl(state)
  }

  const isLogin = mode === 'login'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6ff] px-4 py-10 text-[#1f2f5f]">
      <div className="relative flex w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-[0_34px_70px_-40px_rgba(31,47,95,0.35)]">
        <div
          className={`relative flex w-1/2 min-h-[520px] flex-col items-center justify-center gap-6 p-10 transition-all duration-500 ${
            isLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
          onMouseEnter={() => setMode('login')}
        >
          <div className="absolute inset-0 w-full bg-gradient-to-br from-[#1f2f5f] via-[#238fad] to-[#59c3c3]" />
          <div className="relative flex flex-col items-center gap-6 text-center text-white">
            <div className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
              Welcome Back!
            </div>
            <h1 className="text-3xl font-bold">간편하게 로그인하고 여행 기록을 이어가요</h1>
            <p className="text-sm leading-relaxed text-white/80">
              Google 계정으로 로그인하면 작성한 게시글을 언제든지 수정하고 관리할 수 있어요.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-2 rounded-full border border-white bg-white/10 px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-[#1f2f5f]"
            >
              Google로 로그인
            </button>
          </div>
        </div>

        <div
          className={`ml-auto flex w-1/2 min-h-[520px] flex-col justify-center gap-8 p-12 transition-opacity duration-500 ${
            isLogin ? 'opacity-100' : 'opacity-100'
          }`}
          onMouseEnter={() => setMode('register')}
        >
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
            Create Account
          </div>
          <h2 className="text-3xl font-bold text-[#1f2f5f]">
            <span className="block">RoamLog에 가입하고</span>
            <span className="block">여행 이야기를 시작해요</span>
          </h2>
          <p className="text-sm text-[#4e6e8e]">
            지금은 Google 로그인만 지원하지만, 추후 이메일 가입도 추가될 예정입니다.
          </p>

          <div className="space-y-4 rounded-3xl border border-[#bad7f2]/60 bg-white/90 p-6 shadow-[0_20px_60px_-48px_rgba(31,47,95,0.4)]">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#59c3c3] px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#46b1b1]"
            >
              <span className="text-lg">☁️</span>
              Google 시작하기
            </button>
            <div className="text-center text-xs text-[#7ea6cb]">
              로그인 시 {nextPath === '/' ? '홈으로' : nextPath} 페이지로 이동합니다.
            </div>
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
