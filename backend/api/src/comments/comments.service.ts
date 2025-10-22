import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { AuthUser } from '../auth/interfaces/auth-user.interface'
import { PostsService } from '../posts/posts.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { Comment, CommentDocument } from './schemas/comment.schema'

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly postsService: PostsService,
  ) {}

  async findByPost(postId: string): Promise<CommentDocument[]> {
    await this.postsService.findOne(postId)
    return this.commentModel.find({ postId }).sort({ createdAt: 1 }).exec()
  }

  async create(postId: string, user: AuthUser, payload: CreateCommentDto): Promise<CommentDocument> {
    const content = payload.content?.trim()
    const parentId = payload.parentId?.trim()

    if (!content) {
      throw new BadRequestException('댓글 내용을 입력해 주세요.')
    }

    if (!user.displayName || user.displayName.trim().length === 0) {
      throw new ForbiddenException('닉네임을 설정한 후 댓글을 작성할 수 있어요.')
    }

    await this.postsService.findOne(postId)

    if (parentId) {
      const parentComment = await this.commentModel.findOne({ _id: parentId, postId }).exec()
      if (!parentComment) {
        throw new NotFoundException('원본 댓글을 찾을 수 없어요.')
      }
    }

    const created = new this.commentModel({
      postId,
      content,
      authorId: user.id,
      author: user.displayName.trim(),
      authorAvatarUrl: user.avatarUrl,
      parentId: parentId ?? null,
    })

    return created.save()
  }

  async update(
    postId: string,
    commentId: string,
    user: AuthUser,
    payload: UpdateCommentDto,
  ): Promise<CommentDocument> {
    const content = payload.content?.trim()

    if (!content) {
      throw new BadRequestException('댓글 내용을 입력해 주세요.')
    }

    const target = await this.commentModel.findOne({ _id: commentId, postId }).exec()

    if (!target) {
      throw new NotFoundException('Comment not found')
    }

    if (target.authorId !== user.id) {
      throw new ForbiddenException('자신의 댓글만 수정할 수 있어요.')
    }

    target.content = content
    return target.save()
  }

  async remove(postId: string, commentId: string, user: AuthUser): Promise<void> {
    const target = await this.commentModel.findOne({ _id: commentId, postId }).exec()

    if (!target) {
      throw new NotFoundException('Comment not found')
    }

    if (target.authorId !== user.id) {
      throw new ForbiddenException('자신의 댓글만 삭제할 수 있어요.')
    }

    const idsToDelete = new Set<string>([commentId])
    const stack: string[] = [commentId]

    while (stack.length > 0) {
      const current = stack.pop() as string
      const children = await this.commentModel
        .find({ postId, parentId: current })
        .select('_id')
        .exec()

      for (const child of children) {
        const childId = child._id.toString()
        if (!idsToDelete.has(childId)) {
          idsToDelete.add(childId)
          stack.push(childId)
        }
      }
    }

    await this.commentModel.deleteMany({ _id: { $in: Array.from(idsToDelete) } }).exec()
  }
}
