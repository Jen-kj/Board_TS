import { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'

function ProfileEditPage(): JSX.Element {
  const navigate = useNavigate()
  const { user, completeProfile, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? user.googleDisplayName ?? '')
    }
  }, [user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('사용할 닉네임을 입력해 주세요.')
      return
    }
    setError(null)
    setSuccessMessage(null)
    setSubmitting(true)
    try {
      await completeProfile(trimmed)
      setSuccessMessage('닉네임이 성공적으로 변경되었어요!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 저장에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fde2f3] px-4 py-10 text-[#312e81]">
      <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/60 p-10 shadow-[0_34px_70px_-40px_rgba(244,114,182,0.35)] backdrop-blur-md">
        <h1 className="text-2xl font-bold text-[#be185d]">프로필 수정</h1>
        <p className="mt-3 text-sm text-[#6b7280]">새로운 닉네임을 설정할 수 있어요.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#f472b6]">
            닉네임
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-full border border-[#fbcfe8] bg-white/70 px-4 py-3 text-sm text-[#312e81] outline-none transition focus:border-[#f472b6] focus:ring-2 focus:ring-[#f472b6]/30"
              placeholder="예: 여행러, 감성캠퍼"
              disabled={submitting || loading}
              maxLength={40}
              autoFocus
            />
          </label>

          {error ? <p className="text-center text-xs font-medium text-red-500">{error}</p> : null}
          {successMessage ? <p className="text-center text-xs font-medium text-green-600">{successMessage}</p> : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full rounded-full bg-[#f472b6] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#ec4899] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEditPage