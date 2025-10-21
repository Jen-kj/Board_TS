import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    },
  },
  toObject: {
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    },
  },
})
export class Post {
  @Prop({ required: true })
  categoryId!: string

  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  content!: string

  @Prop({ required: true })
  excerpt!: string

  @Prop({ required: true, default: '익명 여행자' })
  author!: string

  @Prop({ type: [String], default: [] })
  tags!: string[]

  @Prop()
  thumbnailUrl?: string
}

export type PostDocument = HydratedDocument<Post>
export const PostSchema = SchemaFactory.createForClass(Post)
