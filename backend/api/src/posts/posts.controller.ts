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
  findAll(@Query('search') search?: string): Promise<PostDocument[]> {
    return this.postsService.findAll(search)
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
}
