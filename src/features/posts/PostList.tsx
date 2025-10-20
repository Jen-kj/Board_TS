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
}

function PostList({ posts }: PostListProps): JSX.Element {
  if (posts.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-[#89c6f5]/45 bg-white/85 p-12 text-center text-[#34506a] shadow-[0_26px_60px_-38px_rgba(34,49,66,0.18)]">
        아직 등록된 여행 기록이 없어요. 첫 번째 여행 이야기를 남겨보세요!
      </div>
    )
  }

  return (
    <ul className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id} className="group flex flex-col gap-5">
          <div className="overflow-hidden rounded-[32px] border border-white/90 bg-white shadow-[0_24px_60px_-40px_rgba(33,49,66,0.25)] transition group-hover:-translate-y-1 group-hover:shadow-[0_30px_80px_-38px_rgba(33,49,66,0.35)]">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt={`${post.title} 대표 이미지`}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-[#d6ecff] text-xs uppercase tracking-[0.4em] text-[#29455c]">
                No Image
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#223142] group-hover:text-[#2d5671]">
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#34506a]">{post.excerpt}</p>
            <div className="mt-4 flex gap-6 text-xs uppercase tracking-[0.35em] text-[#5b7791]">
              <span>{post.author}</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PostList
