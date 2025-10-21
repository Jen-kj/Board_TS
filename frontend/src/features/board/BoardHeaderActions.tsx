import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface BoardHeaderActionsProps {
  onCompose?: () => void
  canCompose?: boolean
}

function BoardHeaderActions({ onCompose, canCompose = false }: BoardHeaderActionsProps): JSX.Element | null {
  const navigate = useNavigate()
  const { user, logout, setPendingRedirect, loading } = useAuth()

  const displayName = useMemo(() => {
    if (!user) {
      return ''
    }
    if (user.displayName && user.displayName.trim().length > 0) {
      return user.displayName.trim()
    }
    if (user.username && user.username.trim().length > 0) {
      return user.username.trim()
    }
    if (user.googleDisplayName && user.googleDisplayName.trim().length > 0) {
      return user.googleDisplayName.trim()
    }
    return user.email
  }, [user])

  const providerLabel = useMemo(() => {
    if (!user) {
      return ''
    }
    return user.provider === 'google' ? 'Google 로그인' : '닉네임 로그인'
  }, [user])

  const handleCompose = (): void => {
    if (!onCompose || !canCompose) {
      return
    }
    onCompose()
  }

  const handleLogout = (): void => {
    setPendingRedirect('/')
    logout()
    navigate('/auth', { replace: true })
  }

  if (loading && !user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {onCompose ? (
        <button
          type="button"
          onClick={handleCompose}
          disabled={!canCompose || loading}
          className={`rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
            canCompose && !loading
              ? 'bg-white text-[#bad7f2] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)] hover:bg-[#bad7f2] hover:text-[#1f2f5f]'
              : 'cursor-not-allowed bg-white/70 text-[#bad7f2]/60 border-[#bad7f2]/40'
          }`}
        >
          글 작성
        </button>
      ) : null}

      {user ? (
        <div className="flex items-center gap-3 rounded-full border border-[#bad7f2]/60 bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#36577a] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)]">
          <div className="text-left leading-tight">
            <div className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
              {providerLabel}
            </div>
            <div className="text-[11px] font-bold text-[#1f2f5f]">{displayName}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#bad7f2] bg-[#bad7f2]/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-white"
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default BoardHeaderActions
