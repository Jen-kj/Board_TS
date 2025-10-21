import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuthProvider, User, UserDocument } from './schemas/user.schema'

interface UpsertGoogleUserInput {
  email: string
  displayName: string
  providerId: string
  avatarUrl?: string
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec()
  }

  findByProvider(provider: AuthProvider, providerId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ provider, providerId }).exec()
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({ provider: 'google', providerId: input.providerId })
      .exec()

    if (existing) {
      existing.displayName = input.displayName
      existing.email = input.email
      existing.avatarUrl = input.avatarUrl
      return existing.save()
    }

    const created = new this.userModel({
      email: input.email,
      displayName: input.displayName,
      provider: 'google',
      providerId: input.providerId,
      avatarUrl: input.avatarUrl,
    })
    return created.save()
  }
}
