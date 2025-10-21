# Backend (NestJS + MongoDB)

`backend/api`는 NestJS와 Mongoose로 구성된 게시판 API입니다. Docker로 MongoDB를 띄워 놓으면 바로 실행할 수 있어요.

```bash
cd backend/api
npm install
npm run start:dev
```
```

실행할 때 `.env` 파일에 MongoDB URI를 설정하세요 (기본값 `mongodb://localhost:27017/roamlog`). Docker Compose를 이용하면 루트 폴더에서 `docker compose up -d` 명령으로 MongoDB 컨테이너를 띄울 수 있습니다.
