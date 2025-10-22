import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import PostCompose, { PostDraftPayload } from './features/board/PostCompose'
import HomePage, { BoardCategory, PostSummary } from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import PostEditPage from './pages/PostEditPage'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AuthProfileSetupPage from './pages/AuthProfileSetupPage'
import { createPost, deletePost, fetchPosts, updatePost } from './lib/api'
import { useAuth } from './features/auth/useAuth'

function App(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, loading: authLoading, setPendingRedirect, pendingRedirect } = useAuth()
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
  }, [activeSearchTerm])

  useEffect(() => {
    void loadPosts('')
  }, [loadPosts])

  useEffect(() => {
    if (location.pathname === '/compose') {
      const params = new URLSearchParams(location.search)
      const categoryParam = params.get('category')
      if (categoryParam) {
        setComposeTargetCategoryId(categoryParam)
      }
    }
  }, [location])

  useEffect(() => {
    if (authLoading) {
      return
    }

    const isAuthPath = location.pathname.startsWith('/auth')

    if (!token) {
      if (isAuthPath) {
        return
      }
      const currentPath = `${location.pathname}${location.search}`
      setPendingRedirect(currentPath || '/')
      navigate(`/auth?next=${encodeURIComponent(currentPath || '/')}`, { replace: true })
      return
    }

    if (user?.requiresProfileSetup) {
      if (location.pathname !== '/auth/setup') {
        if (!pendingRedirect || pendingRedirect === '/auth/setup') {
          const currentPath = `${location.pathname}${location.search}`
          setPendingRedirect(currentPath || '/')
        }
        navigate('/auth/setup', { replace: true })
      }
      return
    }

    if (!user?.requiresProfileSetup && isAuthPath && location.pathname !== '/auth/callback') {
      const target =
        pendingRedirect && pendingRedirect !== '/auth/setup' ? pendingRedirect : '/'
      setPendingRedirect(null)
      navigate(target, { replace: true })
    }
  }, [
    authLoading,
    token,
    user,
    location,
    navigate,
    setPendingRedirect,
    pendingRedirect,
  ])

  const handleRequireAuth = useCallback(
    (nextPath: string): void => {
      setPendingRedirect(nextPath)
      navigate(`/auth?next=${encodeURIComponent(nextPath)}`)
    },
    [navigate, setPendingRedirect],
  )

  const handleRequestCompose = (categoryId: string): void => {
    const nextPath = `/compose${categoryId ? `?category=${categoryId}` : ''}`
    setComposeTargetCategoryId(categoryId)

    if (!token) {
      handleRequireAuth(nextPath)
      return
    }

    navigate(nextPath)
  }

  const handleRequestEdit = (postId: string): void => {
    const nextPath = `/posts/${postId}/edit`
    if (!token) {
      handleRequireAuth(nextPath)
      return
    }
    navigate(nextPath)
  }

  const handleSubmitPost = async (draft: PostDraftPayload): Promise<void> => {
    if (!token) {
      const nextPath = `/compose${composeTargetCategoryId ? `?category=${composeTargetCategoryId}` : ''}`
      handleRequireAuth(nextPath)
      return
    }

    try {
      setIsLoading(true)
      const created = await createPost(draft, token)
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

  const handleCancelEdit = (postId: string): void => {
    navigate(`/posts/${postId}`)
  }

  const handleUpdatePost = async (postId: string, draft: PostDraftPayload): Promise<void> => {
    if (!token) {
      const nextPath = `/posts/${postId}/edit`
      handleRequireAuth(nextPath)
      return
    }
    try {
      setIsLoading(true)
      await updatePost(postId, draft, token)
      const refreshed = await loadPosts()
      if (!refreshed) {
        setError('게시글은 수정됐지만 목록을 다시 불러오지 못했어요. 잠시 후 새로고침해 주세요.')
      } else {
        setError(null)
      }
      navigate(`/posts/${postId}`)
    } catch (err) {
      console.error(err)
      setError('게시글 수정 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string): Promise<void> => {
    if (!token) {
      const nextPath = `/posts/${postId}`
      handleRequireAuth(nextPath)
      throw new Error('로그인이 필요합니다.')
    }
    try {
      setIsLoading(true)
      await deletePost(postId, token)
      const refreshed = await loadPosts()
      if (!refreshed) {
        setError('게시글은 삭제됐지만 목록을 다시 불러오지 못했어요. 잠시 후 새로고침해 주세요.')
      } else {
        setError(null)
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('게시글 삭제 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
      throw err instanceof Error ? err : new Error('게시글 삭제 실패')
    } finally {
      setIsLoading(false)
    }
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

  const combinedLoading = isLoading || authLoading

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/setup" element={<AuthProfileSetupPage />} />
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
            loading={combinedLoading}
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
            headline="여행 기록 작성"
            description={user ? `${user.displayName}님의 여행 이야기를 공유해 주세요.` : '로그인 후 작성이 가능합니다.'}
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
            searchDisabled={combinedLoading}
            onRequestEdit={handleRequestEdit}
            onDeletePost={handleDeletePost}
            currentUser={user ?? null}
            authToken={token}
            onRequireAuth={handleRequireAuth}
          />
        }
      />
      <Route
        path="/posts/:postId/edit"
        element={
          <PostEditPage
            categories={categories}
            postCache={posts}
            onSubmit={handleUpdatePost}
            onCancel={handleCancelEdit}
            loading={combinedLoading}
            currentUser={user ?? null}
          />
        }
      />
    </Routes>
  )
}

export default App
