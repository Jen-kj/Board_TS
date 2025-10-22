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
import { createPost, deletePost, fetchPosts, updatePost } from './lib/api'
import ProfileEditPage from './pages/ProfileEditPage'
import { useAuth } from './features/auth/useAuth'
import MyPostsPage from './pages/MyPostsPage'

const DEFAULT_PAGE_SIZE = 6

function App(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, loading: authLoading, setPendingRedirect, pendingRedirect } = useAuth()

  const categories = useMemo<BoardCategory[]>(
    () => [
      { id: 'notice', name: '공지사항', type: 'notice' },
      { id: 'review', name: '버킷리스트', type: 'general' },
      { id: 'bucket', name: '후기·추천', type: 'general' },
    ],
    [],
  )

  const [posts, setPosts] = useState<PostSummary[]>([
    {
      id: 'notice-4',
      categoryId: 'notice',
      title: '✨ 프로필 수정 기능이 추가되었어요!',
      author: 'RoamLog 팀',
      authorId: 'admin',
      createdAt: '2024-07-26',
      excerpt:
        '이제 언제든지 닉네임을 변경할 수 있어요. 우측 상단 프로필 메뉴에서 ‘프로필 수정’을 확인해 보세요.',
      content: `<p>안녕하세요, RoamLog 팀입니다.</p>
        <p>많은 분들이 요청해주셨던 프로필 수정 기능이 드디어 추가되었습니다! 이제 언제든지 원하시는 닉네임으로 변경하고 활동하실 수 있습니다.</p>
        <p><strong>[이용 방법]</strong><br/>로그인 후, 우측 상단의 프로필 아이콘을 클릭하여 드롭다운 메뉴에서 '프로필 수정'을 선택해주세요.</p>
        <p>앞으로도 여러분의 즐거운 여행 기록을 위해 노력하는 RoamLog가 되겠습니다. 감사합니다.</p>`,
      likes: [],
      likesCount: 42,
    },
    {
      id: 'notice-2',
      categoryId: 'notice',
      title: '✈️ 새로운 \'후기·추천\' 게시판이 오픈되었습니다!',
      author: 'RoamLog 팀',
      authorId: 'admin',
      createdAt: '2024-07-22',
      excerpt: '여러분의 소중한 여행 경험을 더 생생하게 나눌 수 있는 \'후기·추천\' 게시판이 새롭게 문을 열었습니다.',
      content: `
        <p>안녕하세요, 여행을 사랑하는 RoamLog 회원 여러분!</p>
        <p>여러분의 소중한 여행 경험을 더 생생하게 나눌 수 있는 '후기·추천' 게시판이 새롭게 문을 열었습니다.</p>
        <p>이제 다녀오셨던 멋진 여행지의 후기, 나만 알고 싶은 맛집, 인생샷을 건질 수 있는 포토 스팟 등을 자유롭게 공유해주세요! 여러분의 생생한 후기가 다른 여행자들에게는 소중한 정보가 될 거예요.</p>
        <p>새로운 게시판 오픈을 기념하여, 8월 한 달간 가장 멋진 후기를 남겨주신 세 분께 작은 선물을 드릴 예정이니 많은 참여 부탁드립니다!</p>
        <p>여러분의 멋진 여행 이야기를 기다리겠습니다.<br>감사합니다.</p>`,
      likes: [],
      likesCount: 28,
    },
    {
      id: 'notice-3',
      categoryId: 'notice',
      title: 'RoamLog 커뮤니티 이용 규칙 안내',
      author: 'RoamLog 팀',
      authorId: 'admin',
      createdAt: '2024-07-21',
      excerpt: '모두가 즐겁고 유익한 정보를 나눌 수 있는 공간을 만들기 위해 몇 가지 이용 규칙을 안내해 드립니다.',
      content: `
        <p>안녕하세요, RoamLog에 오신 모든 여행자분들을 환영합니다!</p>
        <p>모두가 즐겁고 유익한 정보를 나눌 수 있는 공간을 만들기 위해 몇 가지 이용 규칙을 안내해 드립니다.</p>
        <br/>
        <ol>
          <li><strong>서로 존중하기:</strong> 비방, 욕설, 타인에게 불쾌감을 주는 언행은 삼가주세요.</li>
          <li><strong>광고/홍보 금지:</strong> 상업적인 목적의 광고, 홍보성 게시물은 예고 없이 삭제될 수 있습니다.</li>
          <li><strong>개인정보 보호:</strong> 타인의 개인정보를 무단으로 게시하거나 유출하지 마세요.</li>
          <li><strong>주제에 맞는 글 작성:</strong> 각 게시판의 성격에 맞는 글을 작성하여 모두가 원하는 정보를 쉽게 찾을 수 있도록 도와주세요.</li>
        </ol>
        <br/>
        <p>위 규칙을 위반할 경우, 서비스 이용에 제한을 받을 수 있습니다.</p>
        <p>건강하고 즐거운 커뮤니티를 함께 만들어가요!</p>
        <p>감사합니다.</p>
      `,
      likes: [],
      likesCount: 5,
    },
    {
      id: 'notice-1',
      categoryId: 'notice',
      title: 'RoamLog 서비스 점검 안내 (7/25 02:00 ~ 04:00)',
      author: 'RoamLog 팀',
      authorId: 'admin',
      createdAt: '2024-07-24',
      excerpt: '보다 안정적인 서비스 제공을 위해 아래와 같이 서버 점검을 진행할 예정입니다.',
      content: '<p>안녕하세요, RoamLog 팀입니다.<br>보다 안정적인 서비스 제공을 위해 아래와 같이 서버 점검을 진행할 예정입니다.</p><ul><li><strong>점검 일시:</strong> 2024년 7월 25일(목) 02:00 ~ 04:00 (약 2시간)</li><li><strong>점검 내용:</strong> 서버 안정화 및 업데이트</li></ul><p>점검 시간 동안에는 서비스 접속이 원활하지 않을 수 있습니다.<br>이용에 불편을 드려 죄송하며, 너른 양해 부탁드립니다.</p><p>더 나은 서비스로 보답하겠습니다.<br>감사합니다.</p>',
      likes: [],
      likesCount: 12,
    },
  ])
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')

  const loadPosts = useCallback(
    async (options?: {
      search?: string
      page?: number
      categoryId?: string
      sort?: 'latest' | 'popular'
    }): Promise<boolean> => {
      const rawSearch = options?.search ?? searchTermRef.current ?? ''
      const nextSearch = rawSearch.trim()
      const nextCategory = options?.categoryId ?? selectedCategoryId ?? ''
      const nextSort = options?.sort ?? sort
      const shouldResetPage =
        options?.search !== undefined || options?.categoryId !== undefined || options?.sort !== undefined
      const fallbackPage = shouldResetPage ? 1 : currentPage
      const requestedPage = options?.page ?? fallbackPage
      const nextPage = requestedPage > 0 ? requestedPage : 1

      setIsLoading(true)
      try {
        const response = await fetchPosts(nextSearch, nextPage, DEFAULT_PAGE_SIZE, nextCategory || undefined, nextSort)
        setPosts(response.items)
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
    [selectedCategoryId, currentPage, activeSearchTerm, sort],
  )

  useEffect(() => {
    // if (!initialLoadRef.current) {
    //   initialLoadRef.current = true
    //   void loadPosts({ search: '', page: 1 })
    // }
  }, [])

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

  const handleSortChange = useCallback(
    (newSort: 'latest' | 'popular') => {
      if (newSort === sort) {
        return
      }
      setSort(newSort)
      void loadPosts({ page: 1, sort: newSort })
    },
    [sort, loadPosts],
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
      <Route path="/my-posts" element={<MyPostsPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
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
            sort={sort}
            onSortChange={handleSortChange}
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