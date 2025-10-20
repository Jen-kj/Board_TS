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
          className={`rounded px-4 py-2 font-medium ${
            canWrite
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          글 작성
        </button>
      }
    >
      {!canWrite ? (
        <p className="mb-4 rounded bg-amber-50 px-4 py-3 text-sm text-amber-700">
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
