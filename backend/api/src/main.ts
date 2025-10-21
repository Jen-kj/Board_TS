import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true })
  app.setGlobalPrefix('api')
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

void bootstrap()
