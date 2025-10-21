import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BoardLayout from '../features/board/BoardLayout'
import type { BoardCategory, PostSummary } from './HomePage'
import type { AuthenticatedUser } from '../lib/api'
import { fetchPost } from '../lib/api'

interface PostDetailPageProps {
  categories: BoardCategory[]
  onRequestCompose: (categoryId: string) => void
  postCache: PostSummary[]
  onRefresh?: () => Promise<boolean | void> | void
  searchValue: string
  onChangeSearch: (value: string) => void
  onSubmitSearch: () => void
  onResetSearch: () => void
  isSearching: boolean
  searchDisabled?: boolean
  onRequestEdit: (postId: string) => void
  onDeletePost: (postId: string) => Promise<void>
  currentUser: AuthenticatedUser | null
}

function PostDetailPage({
  categories,
  onRequestCompose,
  postCache,
  onRefresh,
  searchValue,
  onChangeSearch,
  onSubmitSearch,
  onResetSearch,
  isSearching,
  searchDisabled = false,
  onRequestEdit,
  onDeletePost,
  currentUser,
}: PostDetailPageProps): JSX.Element {
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<PostSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    post?.categoryId ?? categories[0]?.id ?? '',
  )
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  useEffect(() => {
    if (!postId) {
      setError('잘못된 경로예요.')
      setLoading(false)
      return
    }

    const cached = postCache.find((item) => item.id === postId)
    if (cached) {
      setPost(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }

    let isMounted = true

    fetchPost(postId)
      .then((data) => {
        if (!isMounted) {
          return
        }
        setPost(data)
        setError(null)
        onRefresh?.()
      })
      .catch((err) => {
        console.error(err)
        if (!isMounted) {
          return
        }
        setError('게시글을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')
      })
      .finally(() => {
        if (!isMounted) {
          return
        }
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [postId, postCache, onRefresh])

  useEffect(() => {
    if (post?.categoryId) {
      setSelectedCategoryId(post.categoryId)
      return
    }
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [post?.categoryId, categories, selectedCategoryId])

  const category = useMemo(() => {
    if (!post) {
      return null
    }
    return categories.find((item) => item.id === post.categoryId) ?? null
  }, [categories, post])

  const formattedDate = useMemo(() => {
    if (!post?.createdAt) {
      return ''
    }
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(post.createdAt))
    } catch {
      return post.createdAt
    }
  }, [post?.createdAt])

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )

  const canWrite = selectedCategory?.type === 'general'
  const canEditPost = post !== null && currentUser !== null && post.authorId === currentUser.id

  const handleSelectCategory = (categoryId: string): void => {
    setSelectedCategoryId(categoryId)
  }

  const handleClickWrite = (): void => {
    if (!canWrite) {
      return
    }
    onRequestCompose(selectedCategoryId)
  }

  const handleClickEdit = (): void => {
    if (!post) {
      return
    }
    onRequestEdit(post.id)
  }

  const handleClickDelete = async (): Promise<void> => {
    if (!post || isDeleting) {
      return
    }

    const confirmed = window.confirm('정말로 이 게시글을 삭제할까요? 되돌릴 수 없어요.')
    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDeletePost(post.id)
    } catch (err) {
      console.error(err)
      setError('게시글 삭제 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderBody = (): JSX.Element => {
    if (loading) {
      return (
        <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-8 py-6 text-center text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          게시글을 불러오는 중이에요...
        </div>
      )
    }

    if (error || !post) {
      return (
        <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>{error ?? '게시글을 찾을 수 없어요.'}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            목록으로 돌아가기
          </Link>
        </div>
      )
    }

    return (
      <article className="rounded-[32px] border border-[#bad7f2]/60 bg-white/90 p-10 shadow-[0_24px_60px_-40px_rgba(31,47,95,0.22)]">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            목록으로
          </Link>
          {canEditPost ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClickEdit}
                className="rounded-full border border-[#bad7f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2]/60 hover:text-[#1f2f5f]"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleClickDelete()
                }}
                disabled={isDeleting}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  isDeleting
                    ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                    : 'border-red-200 text-red-600 hover:bg-red-100'
                }`}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#36577a]">
          {category?.name ?? '기타'}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-[#1f2f5f]">{post.title}</h1>
        <div className="mt-6 flex flex-wrap gap-6 text-xs uppercase tracking-[0.35em] text-[#4e6e8e]">
          <span className="flex items-center gap-3">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={`${post.author} 프로필 이미지`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bad7f2]/60 text-[11px] font-semibold text-[#1f2f5f]">
                {(post.author?.slice(0, 1) ?? '?').toUpperCase()}
              </span>
            )}
            <span>{post.author ?? '알 수 없음'}</span>
          </span>
          {formattedDate ? <span>{formattedDate}</span> : null}
        </div>

        {post.tags && post.tags.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-[#1f2f5f]">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[#bad7f2]/55 bg-[#bad7f2]/30 px-3 py-1"
              >
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className="prose prose-slate mt-10 max-w-none text-[#36577a]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    )
  }

  if (loading) {
    return (
      <BoardLayout
        title="RoamLog"
        categories={categories.map(({ id, name }) => ({ id, name }))}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        searchValue={searchValue}
        onSearchChange={onChangeSearch}
        onSearchSubmit={onSubmitSearch}
        onResetSearch={onResetSearch}
        isSearching={isSearching}
        searchPlaceholder="제목, 내용, 태그 검색"
        searchDisabled={searchDisabled}
        actionSlot={
          <button
            type="button"
            disabled={!canWrite}
            onClick={handleClickWrite}
            className={`rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
              canWrite
                ? 'bg-white text-[#bad7f2] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)] hover:bg-[#bad7f2] hover:text-[#1f2f5f]'
                : 'cursor-not-allowed bg-white/70 text-[#bad7f2]/60 border-[#bad7f2]/40'
            }`}
          >
            글 작성
          </button>
        }
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-8 py-6 text-center text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
            게시글을 불러오는 중이에요...
          </div>
        </div>
      </BoardLayout>
    )
  }

  if (error || !post) {
    return (
      <BoardLayout
        title="RoamLog"
        categories={categories.map(({ id, name }) => ({ id, name }))}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        searchValue={searchValue}
        onSearchChange={onChangeSearch}
        onSearchSubmit={onSubmitSearch}
        onResetSearch={onResetSearch}
        isSearching={isSearching}
        searchPlaceholder="제목, 내용, 태그 검색"
        searchDisabled={searchDisabled}
        actionSlot={
          <button
            type="button"
            disabled={!canWrite}
            onClick={handleClickWrite}
            className={`rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
              canWrite
                ? 'bg-white text-[#bad7f2] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)] hover:bg-[#bad7f2] hover:text-[#1f2f5f]'
                : 'cursor-not-allowed bg-white/70 text-[#bad7f2]/60 border-[#bad7f2]/40'
            }`}
          >
            글 작성
          </button>
        }
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
            <p>{error ?? '게시글을 찾을 수 없어요.'}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </BoardLayout>
    )
  }

  return (
    <BoardLayout
      title="RoamLog"
      categories={categories.map(({ id, name }) => ({ id, name }))}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={handleSelectCategory}
      searchValue={searchValue}
      onSearchChange={onChangeSearch}
      onSearchSubmit={onSubmitSearch}
      onResetSearch={onResetSearch}
      isSearching={isSearching}
      searchPlaceholder="제목, 내용, 태그 검색"
      searchDisabled={searchDisabled}
      actionSlot={
        <button
          type="button"
          disabled={!canWrite}
          onClick={handleClickWrite}
          className={`rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
            canWrite
              ? 'bg-white text-[#bad7f2] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)] hover:bg-[#bad7f2] hover:text-[#1f2f5f]'
              : 'cursor-not-allowed bg-white/70 text-[#bad7f2]/60 border-[#bad7f2]/40'
          }`}
        >
          글 작성
        </button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {renderBody()}
      </div>
    </BoardLayout>
  )
}

export default PostDetailPage
