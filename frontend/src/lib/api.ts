import type { PostDraftPayload } from '../features/board/PostCompose'
import type { PostSummary } from '../pages/HomePage'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api'

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
}

export async function fetchPosts(): Promise<PostSummary[]> {
  const response = await fetch(`${API_BASE_URL}/posts`)
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`)
  }

  const data = (await response.json()) as PostSummary[]
  return data
}

export async function fetchPost(id: string): Promise<PostSummary> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.status}`)
  }

  const data = (await response.json()) as PostSummary
  return data
}

export async function createPost(payload: PostDraftPayload): Promise<PostSummary> {
  const [firstAttachment] = payload.attachments ?? []

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      categoryId: payload.categoryId,
      title: payload.title,
      content: payload.contentHtml,
      excerpt: payload.excerpt,
      author: '익명 여행자',
      tags: payload.tags,
      thumbnailUrl: firstAttachment?.url,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create post: ${response.status}`)
  }

  const created = (await response.json()) as PostSummary
  return created
}
