import { useMemo, useState } from 'react'
import BoardLayout from '../features/board/BoardLayout'
import PostList from '../features/posts/PostList'

type BoardCategory = {
  id: string
  name: string
  type: 'notice' | 'general'
}

type Post = {
  id: string
  categoryId: string
  title: string
  excerpt: string
  author: string
  createdAt: string
}

function HomePage(): JSX.Element {
  const categories: BoardCategory[] = [
    { id: 'notice', name: '공지사항', type: 'notice' },
    { id: 'bucket', name: '버킷리스트', type: 'general' },
    { id: 'review', name: '후기·추천', type: 'general' },
  ]

  const allPosts: Post[] = [
    {
      id: 'n-1',
      categoryId: 'notice',
      title: '[공지] 커뮤니티 운영 규칙 안내',
      excerpt: '꿈꾸는 여행지를 공유하기 전에 작성 규칙과 태그 사용법을 확인해 주세요.',
      author: '운영팀',
      createdAt: '2024-03-01',
    },
    {
      id: 'n-2',
      categoryId: 'notice',
      title: '[공지] 개인정보 게시 금지 안내',
      excerpt: '이름, 전화번호, 주소, 계좌번호, 주민등록번호, 학교/직장 등 개인을 식별할 수 있는 정보의 게시를 금지',
      author: '운영팀',
      createdAt: '2024-02-15',
    },
    {
      id: 'b-1',
      categoryId: 'bucket',
      title: '언젠가 꼭 가볼 아이슬란드 링로드',
      excerpt: '렌터카로 7일 동안 링로드를 돌고 싶어요. 일정/예산 팁 있으면 부탁드려요!',
      author: '민수',
      createdAt: '2024-03-02',
    },
    {
      id: 'b-2',
      categoryId: 'bucket',
      title: '세자매와 함께하는 부산 미식 투어',
      excerpt: '광안리 야경+밀면+시원한 해산물까지! 봄에 떠나고 싶어요.',
      author: '소정',
      createdAt: '2024-02-27',
    },
    {
      id: 'r-1',
      categoryId: 'review',
      title: '교토 단풍 여행, 3일 코스 추천',
      excerpt: '후시미 이나리→아라시야마→기온 거리 루트로 다녀온 후기 정리했어요.',
      author: '보라',
      createdAt: '2024-03-03',
    },
    {
      id: 'r-2',
      categoryId: 'review',
      title: '세부에서 즐긴 호핑투어 꿀팁',
      excerpt: '물때 맞춰 스노클링, 고프로 촬영 팁, 투어사 선택 경험 공유합니다.',
      author: '다니엘',
      createdAt: '2024-02-20',
    },
  ]

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? '')
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )

  const filteredPosts = useMemo(
    () => allPosts.filter((post) => post.categoryId === selectedCategoryId),
    [allPosts, selectedCategoryId]
  )

  const canWrite =
    selectedCategory !== undefined ? selectedCategory.type === 'general' : false

  const handleClickWrite = (): void => {
    if (!canWrite) {
      return
    }

    // TODO: 추후 글 작성 페이지로 이동 로직 연결
    console.log('Navigate to post composer')
  }

  return (
    <BoardLayout
      title="RoamLog"
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
          글 쓰기
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
        }))}
      />
    </BoardLayout>
  )
}

export default HomePage
