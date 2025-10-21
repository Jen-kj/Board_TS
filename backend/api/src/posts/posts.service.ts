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

  async findAll(search?: string): Promise<PostDocument[]> {
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

    return this.postModel.find(filter).sort({ createdAt: -1 }).exec()
  }

  async findOne(id: string): Promise<PostDocument> {
    const doc = await this.postModel.findById(id).exec()
    if (!doc) {
      throw new NotFoundException('Post not found')
    }
    return doc
  }

  async create(user: AuthUser, payload: CreatePostDto): Promise<PostDocument> {
    const created = new this.postModel({
      ...payload,
      authorId: user.id,
      author: user.displayName,
      authorAvatarUrl: user.avatarUrl,
      tags: payload.tags ?? [],
    })
    return created.save()
  }

  async update(id: string, user: AuthUser, payload: UpdatePostDto): Promise<PostDocument> {
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
}
