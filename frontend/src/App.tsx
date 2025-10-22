import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import BoardLayout from './features/board/BoardLayout'
import BoardHeaderActions from './features/board/BoardHeaderActions'
import PostCompose, { PostDraftPayload } from './features/board/PostCompose'
import HomePage, { BoardCategory, PostSummary } from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import PostEditPage from './pages/PostEditPage'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AuthProfileSetupPage from './pages/AuthProfileSetupPage'
import { createPost, deletePost, fetchMyPosts, fetchPosts, updatePost } from './lib/api'
import { useAuth } from './features/auth/useAuth'

const DEFAULT_PAGE_SIZE = 6

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
  const [myPosts, setMyPosts] = useState<PostSummary[]>([])
  const [myPostsTotalPages, setMyPostsTotalPages] = useState(1)
  const [myPostsTotal, setMyPostsTotal] = useState(0)
  const [myPostsCurrentPage, setMyPostsCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [composeTargetCategoryId, setComposeTargetCategoryId] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('')
  const searchTermRef = useRef<string>('')
  const initialLoadRef = useRef<boolean>(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? '')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalPosts, setTotalPosts] = useState<number>(0)

  const loadPosts = useCallback(
    async (options?: { search?: string; page?: number; categoryId?: string }): Promise<boolean> => {
      const rawSearch = options?.search ?? searchTermRef.current ?? ''
      const nextSearch = rawSearch.trim()
      const nextCategory = options?.categoryId ?? selectedCategoryId ?? ''
      const shouldResetPage = options?.search !== undefined || options?.categoryId !== undefined
      const fallbackPage = shouldResetPage ? 1 : currentPage
      const requestedPage = options?.page ?? fallbackPage
      const nextPage = requestedPage > 0 ? requestedPage : 1

      setIsLoading(true)
      try {
        const response = await fetchPosts(nextSearch, nextPage, DEFAULT_PAGE_SIZE, nextCategory || undefined)
        setPosts(response.items.map((item) => ({ ...item, likes: item.likes ?? [] })))
        setTotalPages(response.totalPages)
        setTotalPosts(response.total)
        setCurrentPage(response.page)
        setError(null)

        if (options?.search !== undefined) {
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
    },
    [selectedCategoryId, currentPage, activeSearchTerm],
  )

  const loadMyPosts = useCallback(
    async (options?: { search?: string; page?: number }): Promise<boolean> => {
      if (!token) {
        setError('내 게시글을 보려면 로그인이 필요해요.')
        return false
      }
      const rawSearch = options?.search ?? ''
      const nextPage = options?.page ?? 1

      setIsLoading(true)
      try {
        const response = await fetchMyPosts(token, rawSearch, nextPage, DEFAULT_PAGE_SIZE)
        setMyPosts(response.items.map((item) => ({ ...item, likes: item.likes ?? [] })))
        setMyPostsTotalPages(response.totalPages)
        setMyPostsTotal(response.total)
        setMyPostsCurrentPage(response.page)
        setError(null)
        return true
      } catch (err) {
        console.error(err)
        setError('내가 쓴 글을 불러오는 데 실패했어요.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      void loadPosts({ search: '', page: 1 })
    }
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
      const refreshed = await loadPosts({ page: 1 })
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
    const refreshed = await loadPosts({ search: trimmed, page: 1 })
    if (!refreshed) {
      setError('검색 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  const handleResetSearch = (): void => {
    if (searchTermRef.current === '' && searchInput === '') {
      return
    }
    setSearchInput('')
    void loadPosts({ search: '', page: 1 })
  }

  const handleSelectCategory = useCallback(
    (categoryId: string): void => {
      if (categoryId === selectedCategoryId) {
        if (currentPage !== 1) {
          setCurrentPage(1)
          void loadPosts({ page: 1 })
        }
        return
      }
      setSelectedCategoryId(categoryId)
      setCurrentPage(1)
      void loadPosts({ categoryId, page: 1 })
    },
    [selectedCategoryId, currentPage, loadPosts],
  )

  const handleChangePage = useCallback(
    (page: number): void => {
      if (page === currentPage || page < 1 || page > totalPages) {
        return
      }
      setCurrentPage(page)
      void loadPosts({ page })
    },
    [currentPage, totalPages, loadPosts],
  )

  const isSearching = activeSearchTerm.trim().length > 0

  const generalCategories = useMemo(
    () => categories.filter((category) => category.type === 'general'),
    [categories],
  )

  const combinedLoading = isLoading || authLoading

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/my-posts"
        element={
          <HomePage
            title="내가 쓴 글"
            categories={[]}
            posts={myPosts}
            onRequestCompose={handleRequestCompose}
            selectedCategoryId=""
            onSelectCategory={() => {}}
            searchValue={searchInput}
            activeSearchTerm={activeSearchTerm}
            onChangeSearch={handleSearchChange}
            onSubmitSearch={() => loadMyPosts({ search: searchInput, page: 1 })}
            onResetSearch={() => { setSearchInput(''); loadMyPosts({ search: '', page: 1 }); }}
            isSearching={isSearching}
            loading={combinedLoading}
            error={error}
            page={myPostsCurrentPage}
            totalPages={myPostsTotalPages}
            totalPosts={myPostsTotal}
            pageSize={DEFAULT_PAGE_SIZE}
            onChangePage={(page) => loadMyPosts({ page })}
          />
        }
      />
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
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            searchValue={searchInput}
            activeSearchTerm={activeSearchTerm}
            onChangeSearch={handleSearchChange}
            onSubmitSearch={handleSearchSubmit}
            onResetSearch={handleResetSearch}
            isSearching={isSearching}
            loading={combinedLoading}
            error={error}
            page={currentPage}
            totalPages={totalPages}
            totalPosts={totalPosts}
            pageSize={DEFAULT_PAGE_SIZE}
            onChangePage={handleChangePage}
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
