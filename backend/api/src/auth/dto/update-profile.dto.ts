import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  displayName!: string
}
