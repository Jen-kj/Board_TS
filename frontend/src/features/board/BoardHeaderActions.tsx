import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface BoardHeaderActionsProps {
  onCompose?: () => void
  canCompose?: boolean
}

function BoardHeaderActions({ onCompose, canCompose = false }: BoardHeaderActionsProps): JSX.Element {
  const navigate = useNavigate()
  const { user, logout, setPendingRedirect, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = useMemo(() => {
    if (!user) return ''
    return (
      user.displayName?.trim() ||
      user.username?.trim() ||
      user.googleDisplayName?.trim() ||
      user.email
    )
  }, [user])

  const handleLogout = (): void => {
    setPendingRedirect('/')
    logout()
    navigate('/auth', { replace: true })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading && !user) {
    return <div className="h-10 w-48 animate-pulse rounded-full bg-slate-200" />
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {onCompose ? (
        <button
          type="button"
          onClick={onCompose}
          disabled={!canCompose || loading}
          className={`rounded-full border border-[#fbcfe8] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
            canCompose && !loading
              ? 'bg-white text-[#be185d] shadow-[0_12px_32px_-18px_rgba(190,24,93,0.2)] hover:bg-[#fbcfe8] hover:text-white'
              : 'cursor-not-allowed bg-white/70 text-[#fbcfe8]/60 border-[#fbcfe8]/40'
          }`}
        >
          글 작성
        </button>
      ) : null}
      <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => setIsMenuOpen((prev) => !prev)} className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbcfe8]/60 text-sm font-semibold text-[#be185d]">
              {(displayName[0] ?? '?').toUpperCase()}
            </span>
          )}
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#fbcfe8]/50 bg-white/95 p-2 text-sm text-[#be185d] shadow-lg backdrop-blur-sm">
            <Link to="/my-posts" className="block w-full rounded-lg px-4 py-2 text-left hover:bg-[#fbcfe8]/40" onClick={() => setIsMenuOpen(false)}>내가 쓴 글</Link>
            <Link to="/profile/edit" className="block w-full rounded-lg px-4 py-2 text-left hover:bg-[#fbcfe8]/40" onClick={() => setIsMenuOpen(false)}>프로필 수정</Link>
            <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-4 py-2 text-left text-red-600 hover:bg-red-100/80">로그아웃</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BoardHeaderActions
