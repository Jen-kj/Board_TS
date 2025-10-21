import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model } from 'mongoose'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { Post, PostDocument } from './schemas/post.schema'

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

  async create(payload: CreatePostDto): Promise<PostDocument> {
    const created = new this.postModel({
      ...payload,
      tags: payload.tags ?? [],
    })
    return created.save()
  }

  async update(id: string, payload: UpdatePostDto): Promise<PostDocument> {
    const doc = await this.postModel.findByIdAndUpdate(id, payload, { new: true }).exec()

    if (!doc) {
      throw new NotFoundException('Post not found')
    }
    return doc
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException('Post not found')
    }
  }
}
