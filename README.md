# Board Monorepo

이 저장소는 프론트엔드(React + Vite)와 향후 NestJS 기반 백엔드를 함께 다루기 위해 여러 프로젝트를 한 곳에 모아둔 구조입니다.

## 디렉터리 구조

- `frontend/` – Vite + React 애플리케이션  
  - `npm install`, `npm run dev` 등은 이 디렉터리에서 실행합니다.  
  - `src/lib/api.ts`가 `VITE_API_BASE_URL`(기본값 `http://localhost:3000/api`)로 지정된 백엔드 REST API와 통신합니다.
- `backend/api` – NestJS 기반 API 서버 템플릿  
  - In-memory 게시글 CRUD를 제공하는 `posts` 모듈이 포함돼 있습니다.
- `dist/` – 프론트엔드 빌드 결과

## 개발 방법

```bash
cd backend/api
npm install
npm run start:dev # http://localhost:3000

# 새 터미널
cd frontend
npm install
npm run dev # http://localhost:5173
```

`.env` 파일로 프론트엔드의 API 엔드포인트(`VITE_API_BASE_URL`)를 조정할 수 있습니다.  
현재 백엔드는 메모리에 데이터를 보관하므로 서버를 재실행하면 게시글이 초기화됩니다. 추후 DB 연결 시 `PostsService`를 교체하면 됩니다.
