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
}

function HomePage({
  title,
  categories,
  posts,
  onRequestCompose,
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
      actionSlot={
        <button
          type="button"
          disabled={!canWrite}
          onClick={handleClickWrite}
          className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${
            canWrite
              ? 'bg-[#223142] text-white shadow-[0_12px_32px_-18px_rgba(34,49,66,0.35)] transition hover:bg-[#1a2838]'
              : 'cursor-not-allowed border border-[#89c6f5]/45 text-[#5b7791]/60'
          }`}
        >
          글 작성
        </button>
      }
    >
      {!canWrite ? (
        <p className="mb-8 rounded-[24px] border border-[#89c6f5]/45 bg-white/85 px-6 py-4 text-sm text-[#2d5671] shadow-[0_24px_60px_-46px_rgba(34,49,66,0.2)]">
          공지 게시판은 운영자만 글을 작성할 수 있어요.
        </p>
      ) : null}

      <PostList
        posts={filteredPosts.map((post) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          author: post.author,
          createdAt: post.createdAt,
          tags: post.tags,
          thumbnailUrl: post.thumbnailUrl,
        }))}
      />
    </BoardLayout>
  )
}

export default HomePage
