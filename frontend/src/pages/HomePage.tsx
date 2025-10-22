import { useMemo } from 'react'
import BoardLayout from '../features/board/BoardLayout'
import BoardHeaderActions from '../features/board/BoardHeaderActions'
import PostList from '../features/posts/PostList'

export type BoardCategory = {
  id: string
  name: string
  type: 'notice' | 'general'
}

export type PostSummary = {
  id: string
  categoryId: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  authorAvatarUrl?: string | null
  createdAt: string
  tags?: string[]
  thumbnailUrl?: string
  likes: string[]
  likesCount: number
}

interface HomePageProps {
  title: string
  categories: BoardCategory[]
  posts: PostSummary[]
  onRequestCompose: (categoryId: string) => void
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  searchValue: string
  activeSearchTerm: string
  onChangeSearch: (value: string) => void
  onSubmitSearch: () => void
  onResetSearch: () => void
  isSearching: boolean
  loading?: boolean
  error?: string | null
  page: number
  totalPages: number
  totalPosts: number
  pageSize: number
  onChangePage: (page: number) => void
  sort: 'latest' | 'popular'
  onSortChange: (sort: 'latest' | 'popular') => void
}

function formatDateOnly(value: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (m) return m[1]
  try {
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear()
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const da = String(d.getDate()).padStart(2, '0')
      return `${y}-${mo}-${da}`
    }
  } catch {}
  return value
}


function HomePage({
  title,
  categories,
  posts,
  onRequestCompose,
  selectedCategoryId,
  onSelectCategory,
  searchValue,
  activeSearchTerm,
  onChangeSearch,
  onSubmitSearch,
  onResetSearch,
  isSearching,
  loading = false,
  error = null,
  page,
  totalPages,
  totalPosts,
  pageSize,
  onChangePage,
  sort,
  onSortChange,
}: HomePageProps): JSX.Element {
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )

  const canWrite = selectedCategory?.type === 'general'

  const handleClickWrite = (): void => {
    if (!canWrite) {
      return
    }

    onRequestCompose(selectedCategoryId)
  }

  const rangeStart = totalPosts === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = totalPosts === 0 ? 0 : Math.min(page * pageSize, totalPosts)

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) {
      return [] as Array<number | 'ellipsis'>
    }

    const siblings = 1
    const pages: Array<number | 'ellipsis'> = []

    pages.push(1)

    const start = Math.max(2, page - siblings)
    const end = Math.min(totalPages - 1, page + siblings)

    if (start > 2) {
      pages.push('ellipsis')
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }, [page, totalPages])

  return (
    <BoardLayout
      title={title}
      categories={categories.map(({ id, name }) => ({ id, name }))}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={onSelectCategory}
      searchValue={searchValue}
      onSearchChange={onChangeSearch}
      onSearchSubmit={onSubmitSearch}
      onResetSearch={onResetSearch}
      isSearching={isSearching}
      searchPlaceholder="제목, 내용, 태그 검색"
      searchDisabled={loading}
      // actionSlot={
      //   <BoardHeaderActions
      //     onCompose={handleClickWrite}
      //     canCompose={canWrite}
      //   />
      // }
          /* 헤더(좌측)는 프로필만: 작성 버튼 제거 */
      actionSlot={<BoardHeaderActions canCompose={canWrite} />}
      /* ⬇️ 카테고리 아래-줄(우측)에만 작성 버튼 배치 */
      belowTabsActionSlot={
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSortChange('latest')}
              disabled={loading}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                sort === 'latest'
                  ? 'border-[#be185d] bg-[#be185d] text-white'
                  : 'border-transparent bg-white text-[#be185d] hover:bg-gray-100'
              }`}
            >
              최신순
            </button>
            <button
              type="button"
              onClick={() => onSortChange('popular')}
              disabled={loading}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                sort === 'popular'
                  ? 'border-[#be185d] bg-[#be185d] text-white'
                  : 'border-transparent bg-white text-[#be185d] hover:bg-gray-100'
              }`}
            >
              인기순
            </button>
          </div>
          {canWrite ? (
            <button
              type="button"
              onClick={handleClickWrite}
              disabled={loading}
              className="rounded-full border border-[#fbcfe8] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#be185d] transition shadow-[0_12px_32px_-18px_rgba(190,24,93,0.2)] hover:bg-[#fbcfe8] hover:text-white"
            >
              글 작성
            </button>
          ) : null}
        </div>
      }
     >
      {!canWrite ? (
        <p className="mb-8 rounded-[24px] border border-[#fbcfe8]/60 bg-white/85 px-6 py-4 text-sm text-[#f472b6] shadow-[0_24px_60px_-46px_rgba(190,24,93,0.15)]">
          공지 게시판은 운영자만 글을 작성할 수 있어요.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[24px] border border-red-200 bg-red-100/60 px-6 py-4 text-sm text-red-700 shadow-[0_24px_60px_-46px_rgba(239,68,68,0.25)]">
          {error}
        </p>
      ) : (
        <PostList
          loading={loading}
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            authorId: post.authorId,
            authorAvatarUrl: post.authorAvatarUrl,
            createdAt: formatDateOnly(post.createdAt),  // ← 날짜만 전달
            tags: post.tags,
            thumbnailUrl: post.thumbnailUrl,
            likesCount: post.likesCount ?? 0,
          }))}
          emptyState={
            isSearching ? (
              <div className="rounded-[32px] border border-dashed border-[#fbcfe8]/55 bg-white/85 p-12 text-center text-[#f472b6] shadow-[0_26px_60px_-38px_rgba(190,24,93,0.18)]">
                <p className="text-sm">
                  <span className="font-semibold text-[#be185d]">"{activeSearchTerm}"</span>에 해당하는 게시글이 없어요.
                </p>
                <p className="mt-2 text-xs">검색어를 다시 입력하거나 초기화해 주세요.</p>
              </div>
            ) : undefined
          }
        />
      )}

      <div className="mt-12 space-y-4">
        {/* <div className="text-center text-sm text-[#f472b6]">
          총 <span className="font-semibold text-[#be185d]">{totalPosts}</span>개의 글 · {rangeStart === 0 ? 0 : rangeStart}–{rangeEnd} / {totalPosts} · 페이지 {page} / {totalPages} · 페이지당 {pageSize}개
        </div> */}
        {totalPages > 1 ? (
          <nav className="flex flex-wrap items-center justify-center gap-2 text-[#f472b6]" aria-label="게시글 페이지네이션">
            <button
              type="button"
              onClick={() => onChangePage(page - 1)}
              disabled={page <= 1 || loading}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                page <= 1 || loading
                  ? 'cursor-not-allowed border-[#fbcfe8]/40 text-[#fbcfe8]'
                  : 'border-[#fbcfe8] text-[#be185d] hover:bg-[#fbcfe8]/40'
              }`}
            >
              이전
            </button>
            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index.toString()}`} className="px-2 text-sm text-[#f9a8d4]">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChangePage(item)}
                  disabled={loading}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    item === page
                      ? 'border-[#be185d] bg-[#be185d] text-white'
                      : 'border-[#fbcfe8] text-[#be185d] hover:bg-[#fbcfe8]/40'
                  } ${loading ? 'cursor-not-allowed' : ''}`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onChangePage(page + 1)}
              disabled={page >= totalPages || loading}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                page >= totalPages || loading
                  ? 'cursor-not-allowed border-[#fbcfe8]/40 text-[#fbcfe8]'
                  : 'border-[#fbcfe8] text-[#be185d] hover:bg-[#fbcfe8]/40'
              }`}
            >
              다음
            </button>
          </nav>
        ) : null}
      </div>
    </BoardLayout>
  )
}

export default HomePage
