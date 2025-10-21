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

interface CreateLocalUserInput {
  email: string
  username: string
  displayName: string
  passwordHash: string
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

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec()
  }

  findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase() }).exec()
  }

  findLocalByIdentifier(identifier: string): Promise<UserDocument | null> {
    const normalized = identifier.toLowerCase()
    return this.userModel
      .findOne({
        provider: 'local',
        $or: [{ username: normalized }, { email: normalized }],
      })
      .exec()
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

  async createLocalUser(input: CreateLocalUserInput): Promise<UserDocument> {
    const trimmedDisplayName = input.displayName.trim()
    if (trimmedDisplayName.length === 0) {
      throw new BadRequestException('닉네임을 입력해 주세요.')
    }

    const created = new this.userModel({
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      displayName: trimmedDisplayName,
      provider: 'local',
      providerId: input.username.toLowerCase(),
      passwordHash: input.passwordHash,
      requiresProfileSetup: false,
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
