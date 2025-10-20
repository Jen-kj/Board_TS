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
      <div className="rounded border border-dashed border-slate-300 p-6 text-center text-slate-500">
        아직 등록된 게시글이 없어요.
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="flex gap-4 rounded border border-slate-200 p-4 shadow-sm">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt=""
              className="h-20 w-32 rounded object-cover"
            />
          ) : null}

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
            <div className="mt-3 text-xs text-slate-500">
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <span>{post.createdAt}</span>
            </div>

            {post.tags && post.tags.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {post.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-slate-100 px-2 py-1">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PostList
