import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import type { PostDocument } from './schemas/post.schema'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(): Promise<PostDocument[]> {
    return this.postsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostDocument> {
    return this.postsService.findOne(id)
  }

  @Post()
  create(@Body() payload: CreatePostDto): Promise<PostDocument> {
    return this.postsService.create(payload)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdatePostDto
  ): Promise<PostDocument> {
    return this.postsService.update(id, payload)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.postsService.remove(id)
  }
}
