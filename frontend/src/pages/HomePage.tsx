import { useEffect, useMemo, useState } from 'react'
import BoardLayout from '../features/board/BoardLayout'
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
  createdAt: string
  tags?: string[]
  thumbnailUrl?: string
}

interface HomePageProps {
  title: string
  categories: BoardCategory[]
  posts: PostSummary[]
  onRequestCompose: (categoryId: string) => void
  searchValue: string
  activeSearchTerm: string
  onChangeSearch: (value: string) => void
  onSubmitSearch: () => void
  onResetSearch: () => void
  isSearching: boolean
  loading?: boolean
  error?: string | null
}

function HomePage({
  title,
  categories,
  posts,
  onRequestCompose,
  searchValue,
  activeSearchTerm,
  onChangeSearch,
  onSubmitSearch,
  onResetSearch,
  isSearching,
  loading = false,
  error = null,
}: HomePageProps): JSX.Element {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id ?? ''
  )
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )

  useEffect(() => {
    if (!categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0]?.id ?? '')
    }
  }, [categories, selectedCategoryId])

  const filteredPosts = useMemo(
    () => posts.filter((post) => post.categoryId === selectedCategoryId),
    [posts, selectedCategoryId]
  )

  const canWrite =
    selectedCategory !== undefined ? selectedCategory.type === 'general' : false

  const handleClickWrite = (): void => {
    if (!canWrite) {
      return
    }

    onRequestCompose(selectedCategoryId)
  }

  return (
    <BoardLayout
      title={title}
      categories={categories.map(({ id, name }) => ({ id, name }))}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={setSelectedCategoryId}
      searchValue={searchValue}
      onSearchChange={onChangeSearch}
      onSearchSubmit={onSubmitSearch}
      onResetSearch={onResetSearch}
      isSearching={isSearching}
      searchPlaceholder="제목, 내용, 태그 검색"
      searchDisabled={loading}
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
      {!canWrite ? (
        <p className="mb-8 rounded-[24px] border border-[#bad7f2]/60 bg-white/85 px-6 py-4 text-sm text-[#36577a] shadow-[0_24px_60px_-46px_rgba(31,47,95,0.15)]">
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
          posts={filteredPosts.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            author: post.author,
            createdAt: post.createdAt,
            tags: post.tags,
            thumbnailUrl: post.thumbnailUrl,
          }))}
          emptyState={
            isSearching ? (
              <div className="rounded-[32px] border border-dashed border-[#bad7f2]/55 bg-white/85 p-12 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
                <p className="text-sm">
                  <span className="font-semibold text-[#1f2f5f]">"{activeSearchTerm}"</span>에 해당하는 게시글이 없어요.
                </p>
                <p className="mt-2 text-xs">검색어를 다시 입력하거나 초기화해 주세요.</p>
              </div>
            ) : undefined
          }
        />
      )}
    </BoardLayout>
  )
}

export default HomePage
