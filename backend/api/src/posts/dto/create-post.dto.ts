import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string

  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsNotEmpty()
  excerpt!: string

  @IsString()
  @IsNotEmpty()
  author!: string

  @IsArray()
  @IsOptional()
  tags?: string[]

  @IsString()
  @IsOptional()
  thumbnailUrl?: string
}
