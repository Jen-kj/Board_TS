import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import type { PostDocument } from './schemas/post.schema'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { AuthUser } from '../auth/interfaces/auth-user.interface'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('sortBy') sortBy?: 'latest' | 'popular',
    @Query('authorId') authorId?: string,   // ← 추가
  ): ReturnType<PostsService['findAll']> {
    const parsedPage = page !== undefined ? Number.parseInt(page, 10) : undefined
    const parsedLimit = limit !== undefined ? Number.parseInt(limit, 10) : undefined

    return this.postsService.findAll({
      search,
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
      categoryId,
      sortBy,
      authorId,                              // ← 추가
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostDocument> {
    return this.postsService.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() payload: CreatePostDto): Promise<PostDocument> {
    return this.postsService.create(user, payload)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() payload: UpdatePostDto
  ): Promise<PostDocument> {
    return this.postsService.update(id, user, payload)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    await this.postsService.remove(id, user)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/likes')
  like(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<PostDocument> {
    return this.postsService.like(id, user)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/likes')
  unlike(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<PostDocument> {
    return this.postsService.unlike(id, user)
  }
}
