# Backend (NestJS 예정)

지금은 구조만 만들어 둔 상태입니다. NestJS 기반 API 서버를 추가할 계획이라면 아래 순서로 진행하세요.

1. Nest CLI 설치
   ```bash
   npm install -g @nestjs/cli
   ```
2. `backend` 디렉터리에서 Nest 프로젝트 초기화
   ```bash
   cd backend
   nest new api
   ```
3. 초기화 후에는 인증, 게시글 CRUD, 댓글 등 필요한 도메인 모듈을 구현하고, `frontend`와 REST API 또는 GraphQL로 통신하도록 구성합니다.

지금 상태에서는 아직 코드가 없으므로, 초기화를 마친 뒤에 커밋해 주세요.
