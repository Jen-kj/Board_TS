import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { PostsModule } from './posts/posts.module'
import { UploadsModule } from './uploads/uploads.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/roamlog'
    ),
    PostsModule,
    UploadsModule,
    AuthModule,
  ],
})
export class AppModule {}
