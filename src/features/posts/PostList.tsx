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
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500 shadow-sm">
        아직 등록된 여행 기록이 없어요. 첫 번째 여행 이야기를 남겨보세요!
      </div>
    )
  }

  return (
    <ul className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id} className="group flex flex-col gap-5">
          <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white/80 shadow-sm transition group-hover:shadow-lg">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt={`${post.title} 대표 이미지`}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-neutral-200/60 text-xs uppercase tracking-[0.4em] text-neutral-500">
                No Image
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-600 group-hover:text-neutral-800">
              {post.title}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
            <div className="mt-4 flex gap-6 text-xs uppercase tracking-[0.35em] text-neutral-400">
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
