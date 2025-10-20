type PostSummary = {
  id: string
  title: string
  excerpt: string
  author: string
  createdAt: string
}

interface PostListProps {
  posts: PostSummary[]
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
        <li key={post.id} className="rounded border border-slate-200 p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
          <div className="mt-3 text-xs text-slate-500">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <span>{post.createdAt}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PostList
