# Board Monorepo

이 저장소는 프론트엔드(React + Vite)와 향후 NestJS 기반 백엔드를 함께 다루기 위해 여러 프로젝트를 한 곳에 모아둔 구조입니다.

## 디렉터리 구조

- `frontend/` – 기존에 작업하던 Vite + React 애플리케이션  
  - `npm install`, `npm run dev` 등은 이 디렉터리에서 실행합니다.  
  - `App.tsx`에 로컬스토리지 기반 게시글 저장 로직이 추가돼 있어서 새로고침해도 글이 유지됩니다.
- `backend/` – NestJS 서버를 추가할 예정인 공간 (초기 README만 존재)
- `dist/` – 프론트엔드 빌드 결과

## 개발 방법

```bash
cd frontend
npm install
npm run dev
```

백엔드 작업을 시작할 때는 `backend` 폴더에서 Nest CLI를 사용해 초기화하거나, 준비된 템플릿을 가져와서 배치하면 됩니다. README에 간단한 가이드를 넣어두었습니다.
