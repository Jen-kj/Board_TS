import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function AuthProfileSetupPage(): JSX.Element {
  const navigate = useNavigate()
  const { user, completeProfile, pendingRedirect, setPendingRedirect, loading } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.googleDisplayName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('사용할 닉네임을 입력해 주세요.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await completeProfile(trimmed)
      const target = pendingRedirect && pendingRedirect !== '/auth/setup' ? pendingRedirect : '/'
      setPendingRedirect(null)
      navigate(target, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 저장에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6ff] px-4 py-10 text-[#1f2f5f]">
      <div className="w-full max-w-md rounded-[32px] border border-[#bad7f2]/60 bg-white/95 p-10 shadow-[0_34px_70px_-40px_rgba(31,47,95,0.35)]">
        <h1 className="text-2xl font-bold text-[#1f2f5f]">닉네임을 설정해 주세요</h1>
        <p className="mt-3 text-sm text-[#4e6e8e]">
          게시판에서 사용할 이름을 정하면 글을 작성하거나 댓글을 남길 수 있어요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-xs font-semibold uppercase tracking-[0.35em] text-[#59a1c3]">
            닉네임
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#bad7f2]/60 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#59c3c3] focus:ring-2 focus:ring-[#59c3c3]/30"
              placeholder="예: 여행러, 감성캠퍼"
              disabled={submitting || loading}
              maxLength={40}
              autoFocus
            />
          </label>

          {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-full bg-[#59c3c3] px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#46b1b1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthProfileSetupPage
