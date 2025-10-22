import { useCallback, useEffect, useMemo, useState } from 'react'
import BoardLayout from '../features/board/BoardLayout'
import PostList from '../features/posts/PostList'
import { fetchPosts } from '../lib/api'
import { useAuth } from '../features/auth/useAuth'
import type { PostSummary } from './HomePage'

const PAGE_SIZE = 9

export default function MyPostsPage(): JSX.Element {
  const { user, loading: authLoading, setPendingRedirect } = useAuth()
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setPendingRedirect('/my-posts')
      window.location.href = `/auth?next=${encodeURIComponent('/my-posts')}`
    }
  }, [authLoading, user, setPendingRedirect])

  const load = useCallback(async (p: number, s: 'latest' | 'popular' = sort) => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await fetchPosts('', p, PAGE_SIZE, undefined, s, user.id)
      setPosts(res.items)
      setTotalPages(res.totalPages)
      setTotal(res.total)
      setPage(res.page)
      setError(null)
    } catch (e) {
      setError('내가 쓴 글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [user, sort])

  useEffect(() => { if (user) { void load(1, sort) } }, [user, load, sort])

  const onSortChange = (newSort: 'latest' | 'popular') => {
    if (newSort === sort) return
    setSort(newSort)
    void load(1, newSort)
  }

  const categories = useMemo(() => [{ id: 'mine', name: '내가 쓴 글' }], [])
  const handlePage = (p: number): void => { if (p >= 1 && p <= totalPages && p !== page) void load(p) }

  return (
    <BoardLayout
      title="내가 쓴 글"
      categories={categories}
      selectedCategoryId="mine"
      onSelectCategory={() => {}}
      isSearching={false}
      searchDisabled
      belowTabsActionSlot={
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSortChange('latest')}
              disabled={isLoading}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                sort === 'latest'
                  ? 'border-[#1f2f5f] bg-[#1f2f5f] text-white'
                  : 'border-transparent bg-white text-[#1f2f5f] hover:bg-gray-100'
              }`}
            >
              최신순
            </button>
            <button
              type="button"
              onClick={() => onSortChange('popular')}
              disabled={isLoading}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                sort === 'popular'
                  ? 'border-[#1f2f5f] bg-[#1f2f5f] text-white'
                  : 'border-transparent bg-white text-[#1f2f5f] hover:bg-gray-100'
              }`}
            >
              인기순
            </button>
          </div>
        </div>
      }
    >
      {error ? (
        <p className="rounded-[24px] border border-red-200 bg-red-100/60 px-6 py-4 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <PostList
          loading={isLoading || authLoading}
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            authorId: post.authorId,
            authorAvatarUrl: post.authorAvatarUrl,
            createdAt: post.createdAt,
            tags: post.tags,
            thumbnailUrl: post.thumbnailUrl,
            likesCount: post.likesCount ?? 0,
          }))}
          emptyState={<div className="rounded-[32px] border border-dashed border-[#bad7f2]/55 bg-white/85 p-12 text-center text-[#36577a]">아직 작성한 글이 없어요.</div>}
        />
      )}

      {totalPages > 1 ? (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[#36577a]">
          <button type="button" onClick={() => handlePage(page - 1)} disabled={page <= 1} className="rounded-full border px-4 py-2 text-xs">이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => handlePage(n)} className={`rounded-full border px-4 py-2 text-xs ${n === page ? 'bg-[#1f2f5f] text-white' : ''}`}>{n}</button>
          ))}
          <button type="button" onClick={() => handlePage(page + 1)} disabled={page >= totalPages} className="rounded-full border px-4 py-2 text-xs">다음</button>
        </nav>
      ) : null}
      <div className="mt-4 text-center text-xs text-[#7ea6cb]">총 {total}개</div>
    </BoardLayout>
  )
}