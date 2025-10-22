import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { PostsModule } from './posts/posts.module'
import { AuthModule } from './auth/auth.module'
import { CommentsModule } from './comments/comments.module'
import { UploadsModule } from './uploads/uploads.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/roamlog'
    ),
    PostsModule,
    CommentsModule,
    UploadsModule,
    AuthModule,
  ],
})
export class AppModule {}
