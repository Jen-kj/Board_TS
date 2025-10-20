# Backend (NestJS 예정)

지금은 구조만 만들어 둔 상태입니다. NestJS 기반 API 서버를 추가할 계획이라면 아래 순서로 진행하세요.

이미 `backend/api` 에 기본 NestJS 프로젝트 뼈대가 추가돼 있습니다. 아래 명령으로 의존성을 설치하고 개발 서버를 실행하세요.

```bash
cd backend/api
npm install
npm run start:dev
```

기본적으로 `http://localhost:3000/api/posts` REST 엔드포인트를 제공합니다. 현재는 인메모리 방식이라 서버를 재시작하면 데이터가 초기화됩니다. DB를 붙이고 싶다면 `PostsService`를 repository/ORM 구현으로 교체하면 됩니다.
