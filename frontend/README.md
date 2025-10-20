# RoamLog Frontend

React + Vite로 구현한 여행 게시판 프론트엔드입니다. 백엔드(NestJS)가 제공하는 REST API(`POST /api/posts` 등)를 호출해서 게시글을 불러오고 저장합니다.

## 개발 환경 실행

```bash
cd frontend
npm install
npm run dev
```

프로젝트 루트(`frontend/`)에 `.env` 파일을 만들어 API 엔드포인트를 지정할 수 있습니다.

```
VITE_API_BASE_URL=http://localhost:3000/api
```

값을 지정하지 않으면 기본값으로 `http://localhost:3000/api`를 사용합니다.

## 스크립트

- `npm run dev` – Vite 개발 서버
- `npm run build` – 정적 빌드
- `npm run preview` – 빌드 결과 미리보기
- `npm run lint` – ESLint 검사
