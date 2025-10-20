export interface PostEntity {
  id: string
  categoryId: string
  title: string
  content: string
  excerpt: string
  author: string
  createdAt: string
  tags?: string[]
  thumbnailUrl?: string
}
