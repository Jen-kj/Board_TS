import {
  BadRequestException,
  Controller,
 Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { randomBytes } from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import type { Request } from 'express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'

const storage = diskStorage({
  destination: (_req, _file, callback) => {
    const uploadDir = join(process.cwd(), 'uploads', 'images')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }
    callback(null, uploadDir)
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`.toLowerCase())
  },
})

const imageFileFilter = (_req: Request, file: Express.Multer.File, callback: any): void => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true)
    return
  }

  callback(new BadRequestException('이미지 파일만 업로드할 수 있어요.'), false)
}

@Controller('uploads')
export class UploadsController {
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ): { id: string; name: string; url: string } {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요해요.')
    }

    const protocol = req.protocol
    const host = req.get('host')
    const baseUrl = `${protocol}://${host}`

    return {
      id: file.filename,
      name: file.originalname,
      url: `${baseUrl}/uploads/images/${file.filename}`,
    }
  }
}
