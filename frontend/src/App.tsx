import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import PostCompose, { PostDraftPayload } from './features/board/PostCompose'
import HomePage, { BoardCategory, PostSummary } from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import { createPost, fetchPosts } from './lib/api'

function App(): JSX.Element {
  const navigate = useNavigate()
  const categories = useMemo<BoardCategory[]>(
    () => [
      { id: 'notice', name: '공지사항', type: 'notice' },
      { id: 'bucket', name: '버킷리스트', type: 'general' },
      { id: 'review', name: '후기·추천', type: 'general' },
    ],
    [],
  )

  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [composeTargetCategoryId, setComposeTargetCategoryId] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('')
  const searchTermRef = useRef<string>('')

  const loadPosts = useCallback(async (search?: string): Promise<boolean> => {
    const nextSearch = search ?? searchTermRef.current ?? ''
    setIsLoading(true)
    try {
      const data = await fetchPosts(nextSearch)
      setPosts(data)
      setError(null)
      if (search !== undefined) {
        searchTermRef.current = nextSearch
        setActiveSearchTerm(nextSearch)
      } else if (searchTermRef.current !== activeSearchTerm) {
        setActiveSearchTerm(searchTermRef.current)
      }
      return true
    } catch (err) {
      console.error(err)
      setError('게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts('')
  }, [loadPosts])

  const handleRequestCompose = (categoryId: string): void => {
    setComposeTargetCategoryId(categoryId)
    navigate('/compose')
  }

  const handleSubmitPost = async (draft: PostDraftPayload): Promise<void> => {
    try {
      setIsLoading(true)
      const created = await createPost(draft)
      const refreshed = await loadPosts()
      if (!refreshed) {
        setError('게시글은 저장됐지만 목록을 다시 불러오지 못했어요. 잠시 후 새로고침해 주세요.')
      }
      setComposeTargetCategoryId('')
      navigate(`/posts/${created.id}`)
    } catch (err) {
      console.error(err)
      setError('게시글 저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCompose = (): void => {
    setComposeTargetCategoryId('')
    navigate('/')
  }

  const handleSearchChange = (value: string): void => {
    setSearchInput(value)
  }

  const handleSearchSubmit = async (): Promise<void> => {
    const trimmed = searchInput.trim()
    setSearchInput(trimmed)
    const refreshed = await loadPosts(trimmed)
    if (!refreshed) {
      setError('검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  const handleResetSearch = (): void => {
    if (searchTermRef.current === '' && searchInput === '') {
      return
    }
    setSearchInput('')
    void loadPosts('')
  }

  const isSearching = activeSearchTerm.trim().length > 0

  const generalCategories = useMemo(
    () => categories.filter((category) => category.type === 'general'),
    [categories],
  )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            title="RoamLog"
            categories={categories}
            posts={posts}
            onRequestCompose={handleRequestCompose}
            searchValue={searchInput}
            activeSearchTerm={activeSearchTerm}
            onChangeSearch={handleSearchChange}
            onSubmitSearch={handleSearchSubmit}
            onResetSearch={handleResetSearch}
            isSearching={isSearching}
            loading={isLoading}
            error={error}
          />
        }
      />
      <Route
        path="/compose"
        element={
          <PostCompose
            categories={generalCategories}
            defaultCategoryId={composeTargetCategoryId}
            onCancel={handleCancelCompose}
            onSubmit={handleSubmitPost}
          />
        }
      />
      <Route
        path="/posts/:postId"
        element={
          <PostDetailPage
            categories={categories}
            onRequestCompose={handleRequestCompose}
            postCache={posts}
            onRefresh={loadPosts}
            searchValue={searchInput}
            onChangeSearch={handleSearchChange}
            onSubmitSearch={handleSearchSubmit}
            onResetSearch={handleResetSearch}
            isSearching={isSearching}
            searchDisabled={isLoading}
          />
        }
      />
    </Routes>
  )
}

export default App
