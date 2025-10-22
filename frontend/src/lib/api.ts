import type { PostDraftPayload } from '../features/board/PostCompose'
import type { PostSummary } from '../pages/HomePage'

export type PostComment = {
  id: string
  postId: string
  content: string
  author: string
  authorId: string
  authorAvatarUrl?: string | null
  createdAt: string
  updatedAt?: string
  parentId?: string | null
}

export type AuthProvider = 'google' | 'local'

export type AuthenticatedUser = {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  requiresProfileSetup: boolean
  googleDisplayName?: string | null
  username?: string | null
  provider: AuthProvider
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api'

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
}

const authHeaders = (token: string): HeadersInit => ({
  ...jsonHeaders,
  Authorization: `Bearer ${token}`,
})

export async function fetchPosts(search?: string): Promise<PostSummary[]> {
  const params = new URLSearchParams()
  if (search && search.trim().length > 0) {
    params.set('search', search.trim())
  }
  const queryString = params.toString()

  const response = await fetch(
    `${API_BASE_URL}/posts${queryString.length > 0 ? `?${queryString}` : ''}`,
  )
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

export async function createPost(payload: PostDraftPayload, token: string): Promise<PostSummary> {
  const [firstAttachment] = payload.attachments ?? []

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      categoryId: payload.categoryId,
      title: payload.title,
      content: payload.contentHtml,
      excerpt: payload.excerpt,
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

export async function uploadImage(file: File): Promise<{ id: string; name: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status}`)
  }

  const data = (await response.json()) as { id: string; name: string; url: string }
  return data
}

export async function updatePost(
  id: string,
  payload: PostDraftPayload,
  token: string,
): Promise<PostSummary> {
  const [firstAttachment] = payload.attachments ?? []

  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({
      categoryId: payload.categoryId,
      title: payload.title,
      content: payload.contentHtml,
      excerpt: payload.excerpt,
      tags: payload.tags,
      thumbnailUrl: firstAttachment?.url,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update post: ${response.status}`)
  }

  const updated = (await response.json()) as PostSummary
  return updated
}

export async function deletePost(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete post: ${response.status}`)
  }
}

export async function fetchCurrentUser(token: string): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(token),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`)
  }

  const data = (await response.json()) as AuthenticatedUser
  return data
}

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`)
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.status}`)
  }

  const data = (await response.json()) as PostComment[]
  return data
}

export async function createComment(
  postId: string,
  content: string,
  token: string,
  parentId?: string,
): Promise<PostComment> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ content, parentId }),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return (await response.json()) as PostComment
}

export async function deleteComment(postId: string, commentId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
  token: string,
): Promise<PostComment> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return (await response.json()) as PostComment
}

type AuthResponse = {
  token: string
  user: AuthenticatedUser
}

export async function updateProfile(token: string, payload: { displayName: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message ?? data?.error
    throw new Error(message ?? `Failed to update profile: ${response.status}`)
  }

  return (await response.json()) as AuthResponse
}

const extractErrorMessage = async (response: Response): Promise<string> => {
  const data = await response.json().catch(() => null)
  const message = Array.isArray(data?.message) ? data?.message[0] : data?.message ?? data?.error
  return message ?? `Request failed: ${response.status}`
}

export async function registerLocalAccount(payload: {
  username: string
  password: string
  displayName: string
  email: string
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/local/register`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return (await response.json()) as AuthResponse
}

export async function loginLocalAccount(payload: {
  identifier: string
  password: string
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/local/login`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return (await response.json()) as AuthResponse
}

export function buildGoogleAuthUrl(state?: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const url = new URL(`${base}/auth/google`)
  if (state) {
    url.searchParams.set('state', state)
  }
  return url.toString()
}
