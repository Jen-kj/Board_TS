import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PostEntity } from './entities/post.entity'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostsService {
  private posts: PostEntity[] = []

  findAll(): PostEntity[] {
    return this.posts
  }

  findOne(id: string): PostEntity {
    const post = this.posts.find((item) => item.id === id)
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    return post
  }

  create(payload: CreatePostDto): PostEntity {
    const now = new Date().toISOString()
    const post: PostEntity = {
      id: randomUUID(),
      createdAt: now,
      ...payload,
    }
    this.posts = [post, ...this.posts]
    return post
  }

  update(id: string, payload: UpdatePostDto): PostEntity {
    const index = this.posts.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException('Post not found')
    }

    const updated: PostEntity = {
      ...this.posts[index],
      ...payload,
    }
    this.posts[index] = updated
    return updated
  }

  remove(id: string): void {
    const exists = this.posts.some((item) => item.id === id)
    if (!exists) {
      throw new NotFoundException('Post not found')
    }
    this.posts = this.posts.filter((item) => item.id !== id)
  }
}
