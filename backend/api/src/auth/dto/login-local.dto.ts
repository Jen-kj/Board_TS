import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginLocalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identifier!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string
}
