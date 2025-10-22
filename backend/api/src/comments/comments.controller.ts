import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { AuthUser } from '../auth/interfaces/auth-user.interface'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import type { CommentDocument } from './schemas/comment.schema'

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('postId') postId: string): Promise<CommentDocument[]> {
    return this.commentsService.findByPost(postId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthUser,
    @Body() payload: CreateCommentDto,
  ): Promise<CommentDocument> {
    return this.commentsService.create(postId, user, payload)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async remove(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.commentsService.remove(postId, commentId, user)
  }
}
