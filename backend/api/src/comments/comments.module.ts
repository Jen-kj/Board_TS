import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module'
import { PostsModule } from '../posts/posts.module'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { Comment, CommentSchema } from './schemas/comment.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AuthModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
