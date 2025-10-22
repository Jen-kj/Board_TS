import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const options: Record<string, string> = {}

    // 'prompt' 파라미터를 Google 인증 옵션으로 전달합니다.
    if (req.query.prompt) {
      options.prompt = req.query.prompt
    }

    return options
  }
}