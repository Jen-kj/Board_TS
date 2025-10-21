import { Link } from 'react-router-dom'

type PostListItem = {
  id: string
  title: string
  excerpt: string
  author: string
  createdAt: string
  thumbnailUrl?: string
  tags?: string[]
}

interface PostListProps {
  posts: PostListItem[]
  loading?: boolean
}

function PostList({ posts, loading = false }: PostListProps): JSX.Element {
  if (loading) {
    return (
      <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-6 py-10 text-center text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
        데이터를 불러오는 중이에요...
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-[#bad7f2]/55 bg-white/85 p-12 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
        아직 등록된 여행 기록이 없어요. 첫 번째 여행 이야기를 남겨보세요!
      </div>
    )
  }

  return (
    <ul className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            to={`/posts/${post.id}`}
            className="group flex flex-col gap-5 rounded-[32px] text-[#1f2f5f] no-underline outline-none transition focus-visible:ring-2 focus-visible:ring-[#bad7f2] focus-visible:ring-offset-2"
          >
            <div className="overflow-hidden rounded-[32px] border border-white/85 bg-white shadow-[0_24px_60px_-40px_rgba(31,47,95,0.22)] transition group-hover:-translate-y-1 group-hover:shadow-[0_30px_80px_-36px_rgba(31,47,95,0.32)]">
              {post.thumbnailUrl ? (
                <img
                  src={post.thumbnailUrl}
                  alt={`${post.title} 대표 이미지`}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-[#bad7f2] text-xs uppercase tracking-[0.4em] text-[#1f2f5f]">
                  No Image
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition group-hover:text-[#36577a]">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-[#36577a]">{post.excerpt}</p>
              <div className="mt-4 flex gap-6 text-xs uppercase tracking-[0.35em] text-[#4e6e8e]">
                <span>{post.author}</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default PostList
