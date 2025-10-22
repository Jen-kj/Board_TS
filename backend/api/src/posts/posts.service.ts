import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { Post, PostDocument } from './schemas/post.schema'
import type { AuthUser } from '../auth/interfaces/auth-user.interface'

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>
  ) {}

  async findAll(params: {
    search?: string
    page?: number
    limit?: number
    categoryId?: string
    sortBy?: 'latest' | 'popular'
  }): Promise<{
    items: PostDocument[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { search, page = 1, categoryId, sortBy = 'latest' } = params
    const filter: FilterQuery<PostDocument> = {}

    if (search && search.trim().length > 0) {
      const escaped = escapeRegex(search.trim())
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { excerpt: { $regex: regex } },
        { tags: { $regex: regex } },
      ]
    }

    if (categoryId && categoryId.trim().length > 0) {
      filter.categoryId = categoryId.trim()
    }

    const pageNumber = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
    const perPage = 6 // ← 페이지당 항목 수 고정
    const total = await this.postModel.countDocuments(filter).exec()
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.max(1, Math.min(pageNumber, totalPages))
    const skip = (safePage - 1) * perPage

    const sort: Record<string, 1 | -1> = {}
    if (sortBy === 'popular') {
      sort.likesCount = -1
    }
    sort.createdAt = -1

    const items = await this.postModel.find(filter).sort(sort).skip(skip).limit(perPage).exec()

    return {
      items,
      total,
      page: safePage,
      limit: perPage,
      totalPages,
    }
  }

  async findAllByAuthor(
    user: AuthUser,
    params: {
      search?: string
      page?: number
      limit?: number
      categoryId?: string
      authorId?: string            // 내가 쓴 글
    },
  ): Promise<{
    items: PostDocument[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { search, page = 1, categoryId } = params
    const filter: FilterQuery<PostDocument> = {
      authorId: user.id,
    }

    if (search && search.trim().length > 0) {
      const escaped = escapeRegex(search.trim())
      const regex = new RegExp(escaped, 'i')
      filter.$or = [{ title: { $regex: regex } }, { content: { $regex: regex } }]
    }

    if (categoryId && categoryId.trim().length > 0) {
      filter.categoryId = categoryId.trim()
    }

    if (authorId && authorId.trim().length > 0) {
      filter.authorId = authorId.trim()        // ← 추가
    }

    const pageNumber = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
    const perPage = 6 // ← 페이지당 항목 수 고정
    const total = await this.postModel.countDocuments(filter).exec()
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.max(1, Math.min(pageNumber, totalPages))
    const skip = (safePage - 1) * perPage

    const items = await this.postModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).exec()

    return { items, total, page: safePage, limit: perPage, totalPages }
  }

  async findOne(id: string): Promise<PostDocument> {
    const doc = await this.postModel.findById(id).exec()
    if (!doc) {
      throw new NotFoundException('Post not found')
    }
    return doc
  }

  async create(user: AuthUser, payload: CreatePostDto): Promise<PostDocument> {
    if (!user.displayName || user.displayName.trim().length === 0) {
      throw new ForbiddenException('닉네임을 설정한 후 글을 작성할 수 있어요.')
    }

    const created = new this.postModel({
      ...payload,
      authorId: user.id,
      author: user.displayName.trim(),
      authorAvatarUrl: user.avatarUrl,
      tags: payload.tags ?? [],
    })
    return created.save()
  }

  async update(id: string, user: AuthUser, payload: UpdatePostDto): Promise<PostDocument> {
    if (!user.displayName || user.displayName.trim().length === 0) {
      throw new ForbiddenException('닉네임을 설정한 후 글을 수정할 수 있어요.')
    }
    const target = await this.postModel.findById(id).exec()

    if (!target) {
      throw new NotFoundException('Post not found')
    }

    if (target.authorId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this post')
    }

    target.title = payload.title ?? target.title
    target.content = payload.content ?? target.content
    target.excerpt = payload.excerpt ?? target.excerpt
    target.categoryId = payload.categoryId ?? target.categoryId
    target.tags = payload.tags ?? target.tags
    target.thumbnailUrl = payload.thumbnailUrl ?? target.thumbnailUrl

    return target.save()
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const doc = await this.postModel.findById(id).exec()
    if (!doc) {
      throw new NotFoundException('Post not found')
    }

    if (doc.authorId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this post')
    }

    await doc.deleteOne()
  }

  async like(id: string, user: AuthUser): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec()
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (!post.likes.includes(user.id)) {
      post.likes.push(user.id)
      post.likesCount = post.likes.length
      await post.save()
    }

    return post
  }

  async unlike(id: string, user: AuthUser): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec()
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.likes.includes(user.id)) {
      post.likes = post.likes.filter((likeUserId) => likeUserId !== user.id)
      post.likesCount = post.likes.length
      await post.save()
    }

    return post
  }
}
