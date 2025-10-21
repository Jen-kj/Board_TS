import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PostCompose, { PostDraftPayload } from '../features/board/PostCompose'
import type { BoardCategory, PostSummary } from './HomePage'
import { fetchPost, type AuthenticatedUser } from '../lib/api'

interface PostEditPageProps {
  categories: BoardCategory[]
  postCache: PostSummary[]
  onSubmit: (postId: string, draft: PostDraftPayload) => Promise<void>
  onCancel: (postId: string) => void
  loading?: boolean
  currentUser: AuthenticatedUser | null
}

function extractTextContent(html: string): string {
  const container = document.createElement('div')
  container.innerHTML = html
  return container.textContent ?? ''
}

function extractAttachmentsFromHtml(html: string): PostDraftPayload['attachments'] {
  const container = document.createElement('div')
  container.innerHTML = html
  const images = Array.from(container.querySelectorAll('img'))

  return images.map((img, index) => ({
    id: img.dataset.attachmentId ?? `existing-${index}`,
    name: img.getAttribute('alt') ?? `이미지 ${index + 1}`,
    url: img.getAttribute('src') ?? '',
  })).filter((attachment) => attachment.url.length > 0)
}

function PostEditPage({
  categories,
  postCache,
  onSubmit,
  onCancel,
  loading = false,
  currentUser,
}: PostEditPageProps): JSX.Element {
  const navigate = useNavigate()
  const { postId } = useParams<{ postId: string }>()
  const [initialDraft, setInitialDraft] = useState<PostDraftPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetching, setFetching] = useState<boolean>(true)
  const [ownerId, setOwnerId] = useState<string | null>(null)

  const cached = useMemo(() => postCache.find((item) => item.id === postId), [postCache, postId])

  useEffect(() => {
    if (!postId) {
      setError('잘못된 경로예요.')
      setFetching(false)
      return
    }

    if (cached) {
      const attachments = extractAttachmentsFromHtml(cached.content)
      const plainText = extractTextContent(cached.content)
      setInitialDraft({
        categoryId: cached.categoryId,
        title: cached.title,
        contentHtml: cached.content,
        plainText,
        excerpt: cached.excerpt,
        tags: cached.tags ?? [],
        attachments,
      })
      setOwnerId(cached.authorId)
      setFetching(false)
    } else {
      setFetching(true)
    }

    let isMounted = true

    fetchPost(postId)
      .then((data) => {
        if (!isMounted) {
          return
        }

        const attachments = extractAttachmentsFromHtml(data.content)
        const plainText = extractTextContent(data.content)
        setInitialDraft({
          categoryId: data.categoryId,
          title: data.title,
          contentHtml: data.content,
          plainText,
          excerpt: data.excerpt,
          tags: data.tags ?? [],
          attachments,
        })
        setOwnerId(data.authorId)
        setError(null)
      })
      .catch((err: unknown) => {
        console.error(err)
        if (!isMounted) {
          return
        }
        setError('게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      })
      .finally(() => {
        if (!isMounted) {
          return
        }
        setFetching(false)
      })

    return () => {
      isMounted = false
    }
  }, [postId, cached])

  const handleSubmit = async (draft: PostDraftPayload): Promise<void> => {
    if (!postId) {
      return
    }

    await onSubmit(postId, draft)
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffdbE5] text-[#36577a]">
        <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>로그인 후에만 게시글을 수정할 수 있어요.</p>
          <button
            type="button"
            onClick={() => navigate(`/auth?next=${encodeURIComponent(`/posts/${postId}/edit`)}`)}
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    )
  }

  if (ownerId && currentUser.id !== ownerId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffdbE5] text-[#36577a]">
        <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>이 게시글을 수정할 권한이 없어요.</p>
          <button
            type="button"
            onClick={() => navigate(`/posts/${postId}`)}
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            게시글로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!postId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffdbE5] text-[#36577a]">
        <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>잘못된 경로예요.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffdbE5] text-[#36577a]">
        <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-8 py-6 text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          게시글 정보를 불러오는 중이에요...
        </div>
      </div>
    )
  }

  if (!initialDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffdbE5] text-[#36577a]">
        <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>{error ?? '게시글 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffdbE5]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {error ? (
          <div className="mb-6 rounded-[24px] border border-red-200 bg-red-100/60 px-6 py-4 text-sm text-red-700 shadow-[0_24px_60px_-46px_rgba(239,68,68,0.25)]">
            {error}
          </div>
        ) : null}
        <PostCompose
          categories={categories.filter((category) => category.type === 'general')}
          defaultCategoryId={initialDraft.categoryId}
          initialDraft={initialDraft}
          onCancel={() => onCancel(postId)}
          onSubmit={handleSubmit}
          headline="게시글 수정"
          description="내용을 편집한 후 저장하면 기존 게시글에 바로 반영돼요."
          submitLabel={loading ? '저장 중...' : '수정 완료'}
        />
      </div>
    </div>
  )
}

export default PostEditPage
