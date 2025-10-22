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
export class Comment {
  @Prop({ required: true })
  postId!: string

  @Prop({ required: true })
  authorId!: string

  @Prop({ required: true })
  author!: string

  @Prop()
  authorAvatarUrl?: string

  @Prop({ required: true })
  content!: string
}

export type CommentDocument = HydratedDocument<Comment>
export const CommentSchema = SchemaFactory.createForClass(Comment)
