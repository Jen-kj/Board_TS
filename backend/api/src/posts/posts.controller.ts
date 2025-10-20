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
import { PostEntity } from './entities/post.entity'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(): PostEntity[] {
    return this.postsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): PostEntity {
    return this.postsService.findOne(id)
  }

  @Post()
  create(@Body() payload: CreatePostDto): PostEntity {
    return this.postsService.create(payload)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePostDto): PostEntity {
    return this.postsService.update(id, payload)
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    this.postsService.remove(id)
  }
}
