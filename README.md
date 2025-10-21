# Board Monorepo

이 저장소는 프론트엔드(React + Vite)와 향후 NestJS 기반 백엔드를 함께 다루기 위해 여러 프로젝트를 한 곳에 모아둔 구조입니다.

## 디렉터리 구조

- `frontend/` – Vite + React 애플리케이션  
  - `npm install`, `npm run dev` 등은 이 디렉터리에서 실행합니다.  
  - `src/lib/api.ts`가 `VITE_API_BASE_URL`(기본값 `http://localhost:3000/api`)로 지정된 백엔드 REST API와 통신합니다.
- `backend/api` – NestJS 기반 API 서버  
  - MongoDB(Mongoose)로 게시글 CRUD를 제공합니다. 
- `docker-compose.yml` – MongoDB 컨테이너를 쉽게 띄우기 위한 설정
- `dist/` – 프론트엔드 빌드 결과

## 개발 방법

1. **MongoDB 컨테이너 실행**
   ```bash
   docker compose up -d
   ```
   기본 URI는 `mongodb://localhost:27017/roamlog`입니다.

2. **백엔드 실행**
   ```bash
   cd backend/api
   cp .env.example .env # 필요 시 URI 수정
   npm install
   npm run start:dev # http://localhost:3000/api
   ```

3. **프론트엔드 실행**
   ```bash
   cd frontend
   npm install
   npm run dev # http://localhost:5173
   ```

`.env` 파일에서 프론트의 `VITE_API_BASE_URL`을 원하는 백엔드 주소로 조정할 수 있습니다.
