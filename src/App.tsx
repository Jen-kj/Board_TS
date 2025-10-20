import { useMemo, useState } from 'react'
import PostCompose, { PostDraftPayload } from './features/board/PostCompose'
import HomePage, { BoardCategory, PostSummary } from './pages/HomePage'

type Page = 'home' | 'compose'

function App(): JSX.Element {
  const [categories] = useState<BoardCategory[]>([
    { id: 'notice', name: '공지사항', type: 'notice' },
    { id: 'bucket', name: '버킷리스트', type: 'general' },
    { id: 'review', name: '후기·추천', type: 'general' },
  ])
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [composeTargetCategoryId, setComposeTargetCategoryId] = useState<string>('')

  const handleRequestCompose = (categoryId: string): void => {
    setComposeTargetCategoryId(categoryId)
    setCurrentPage('compose')
  }

  const handleSubmitPost = (draft: PostDraftPayload): void => {
    const now = new Date()

    const newPost: PostSummary = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `post-${Date.now()}`,
      categoryId: draft.categoryId,
      title: draft.title,
      content: draft.contentHtml,
      excerpt: draft.excerpt,
      author: '익명 여행자',
      createdAt: now.toISOString().slice(0, 10),
      tags: draft.tags,
      thumbnailUrl: draft.attachments[0]?.url,
    }

    setPosts((prev) => [newPost, ...prev])
    setCurrentPage('home')
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
    />
  )
}

export default App
