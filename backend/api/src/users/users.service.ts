import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
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
      existing.email = input.email
      existing.avatarUrl = input.avatarUrl
      existing.googleDisplayName = input.displayName
      return existing.save()
    }

    const created = new this.userModel({
      email: input.email,
      provider: 'google',
      providerId: input.providerId,
      avatarUrl: input.avatarUrl,
      googleDisplayName: input.displayName,
      displayName: '',
      requiresProfileSetup: true,
    })

    return created.save()
  }

  async updateProfile(userId: string, displayName: string): Promise<UserDocument> {
    const trimmed = displayName.trim()
    if (trimmed.length === 0) {
      throw new BadRequestException('닉네임을 입력해 주세요.')
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          displayName: trimmed,
          requiresProfileSetup: false,
        },
        { new: true }
      )
      .exec()

    if (!updated) {
      throw new NotFoundException('사용자를 찾을 수 없어요.')
    }

    return updated
  }
}
