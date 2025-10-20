import { useEffect, useMemo, useState } from 'react'
import './App.css'
import PostCompose, { PostDraftPayload } from './features/board/PostCompose'
import HomePage, { BoardCategory, PostSummary } from './pages/HomePage'
import { createPost, fetchPosts } from './lib/api'

type Page = 'home' | 'compose'

function App(): JSX.Element {
  const [categories] = useState<BoardCategory[]>([
    { id: 'notice', name: '공지사항', type: 'notice' },
    { id: 'bucket', name: '버킷리스트', type: 'general' },
    { id: 'review', name: '후기·추천', type: 'general' },
  ])

  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [composeTargetCategoryId, setComposeTargetCategoryId] = useState<string>('')

  useEffect(() => {
    setIsLoading(true)
    void fetchPosts()
      .then((data) => {
        setPosts(data)
        setError(null)
      })
      .catch((err: unknown) => {
        console.error(err)
        setError('게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleRequestCompose = (categoryId: string): void => {
    setComposeTargetCategoryId(categoryId)
    setCurrentPage('compose')
  }

  const handleSubmitPost = async (draft: PostDraftPayload): Promise<void> => {
    try {
      setIsLoading(true)
      const created = await createPost(draft)
      setPosts((prev) => [created, ...prev])
      setError(null)
      setCurrentPage('home')
    } catch (err) {
      console.error(err)
      setError('게시글 저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCompose = (): void => {
    setCurrentPage('home')
  }

  const pageTitle = useMemo(() => 'RoamLog', [])

  if (currentPage === 'compose') {
    return (
      <PostCompose
        categories={categories.filter((category) => category.type === 'general')}
        defaultCategoryId={composeTargetCategoryId}
        onCancel={handleCancelCompose}
        onSubmit={handleSubmitPost}
      />
    )
  }

  return (
    <HomePage
      title={pageTitle}
      categories={categories}
      posts={posts}
      onRequestCompose={handleRequestCompose}
      loading={isLoading}
      error={error}
    />
  )
}

export default App
