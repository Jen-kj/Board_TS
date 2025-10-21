import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class RegisterLocalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9._-]+$/i, {
    message: '아이디는 영문, 숫자, ., _, -만 사용할 수 있어요.',
  })
  username!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  displayName!: string

  @IsEmail({}, { message: '올바른 이메일 주소를 입력해 주세요.' })
  @MaxLength(100)
  email!: string
}
