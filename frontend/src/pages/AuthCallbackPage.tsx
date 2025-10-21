import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function AuthCallbackPage(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginWithToken, pendingRedirect } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])

  useEffect(() => {
    const token = searchParams.get('token')
    const stateParam = searchParams.get('state')

    if (!token) {
      setError('로그인 토큰을 받지 못했어요. 다시 시도해 주세요.')
      return
    }

    const decodedState = stateParam ? decodeURIComponent(stateParam) : null
    const nextTarget = decodedState && decodedState.startsWith('/') ? decodedState : pendingRedirect
    const decodedNext = nextTarget && nextTarget.startsWith('/') ? nextTarget : '/'

    loginWithToken(token)
      .then(() => {
        navigate(decodedNext || '/', { replace: true })
      })
      .catch(() => {
        setError('로그인 과정에서 오류가 발생했어요. 다시 시도해 주세요.')
      })
  }, [searchParams, loginWithToken, navigate, pendingRedirect])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6ff] text-[#1f2f5f]">
      <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/90 px-10 py-8 text-center shadow-[0_30px_80px_-46px_rgba(31,47,95,0.22)]">
        {error ? (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/auth', { replace: true })}
              className="mt-4 rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2]/30"
            >
              로그인 페이지로 이동
            </button>
          </>
        ) : (
          <p className="text-sm font-medium tracking-[0.35em] text-[#36577a]">
            로그인 처리 중이에요...
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackPage
