# 모여 - 프론트엔드 레포지토리 (FSD Architecture)

> 친구들과의 약속을 위한 **중간 장소 및 식당 추천 서비스**, **모여(Moyeo)**의 프론트엔드 레포입니다.
> 5주 MVP 일정에 맞춰 빠르게 굴리되, 계층 분리(FSD)로 나중에 후회하지 않게 설계되어 있습니다.

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS** |
| UI Kit | **shadcn/ui** + **lucide-react** |
| State | **Zustand** |
| HTTP | **Axios** |
| Architecture | **Feature-Sliced Design (FSD)** |
| Lint | ESLint + `eslint-plugin-boundaries` (FSD 의존성 규칙 강제) |

---

## 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 세팅
```bash
cp .env.example .env.local
```
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 채우기.

### 3. 개발 서버 실행
```bash
npm run dev
```
👉 http://localhost:3000

### 4. shadcn/ui 컴포넌트 추가 (필요 시)
```bash
npx shadcn@latest add button input dialog
```
`components.json` 설정에 따라 `src/shared/ui/`에 생성됩니다.

---

## 폴더 구조 (FSD)

```
src/
 ├─ app/        # Next.js App Router · 글로벌 Provider · 전역 스타일
 │   ├─ layout.tsx
 │   ├─ page.tsx       (views/의 컴포넌트를 import만)
 │   └─ globals.css
 ├─ views/      # 라우트별 페이지 조립 컴포넌트
 │   └─ home/
 │       ├─ ui/HomeView.tsx
 │       └─ index.ts   (Public API)
 ├─ widgets/    # 독립적 UI 블록 (Header, KakaoMapViewer 등)
 │   └─ header/
 │       ├─ ui/Header.tsx
 │       └─ index.ts
 ├─ features/   # 사용자 상호작용 단위 (RoomCreateForm, VoteAction 등)
 ├─ entities/   # 비즈니스 도메인 (room, user, location ...)
 └─ shared/     # 공통 자원 (UI 킷 · axios · 유틸 · 타입 · config)
     ├─ ui/            (shadcn 컴포넌트가 여기에 추가됨)
     ├─ lib/utils.ts   (cn helper 등)
     ├─ api/axios-instance.ts
     └─ config/env.ts
```

각 슬라이스는 보통 다음 세그먼트로 나눠 작성합니다:

```
<slice>/
 ├─ ui/      # 컴포넌트
 ├─ model/   # 상태(Zustand store), 타입, 비즈니스 로직
 ├─ api/     # 서버 통신 함수
 ├─ lib/     # 슬라이스 내부 헬퍼
 └─ index.ts # Public API (외부에 노출할 것만 export)
```

---

## FSD 계층(Layer) 가이드 — *처음 보는 사람을 위해*

> 한 줄 요약: **위에서 아래로만 의존이 흐른다.**
> `app → views → widgets → features → entities → shared`

### 1. `shared/` — 가장 낮은 계층, 도메인 무관
- 어디서든 재사용되는 **순수 자원**: shadcn 컴포넌트, axios 인스턴스, util 함수, 공통 타입, env.
- "이건 모여 서비스에서만 의미있다"라는 코드는 ❌. 비즈니스 로직 없음.

### 2. `entities/` — 비즈니스 도메인의 최소 단위
- 한 도메인 객체(room, user, location, vote)의 **모델 · 타입 · 서버 fetch · 표현용 UI**.
- 예: `entities/room/model/types.ts`, `entities/room/api/fetch-room.ts`, `entities/room/ui/RoomCard.tsx`.

### 3. `features/` — 사용자가 수행하는 단일 동작
- "방 만들기", "위치 입력하기", "후보 식당에 투표하기"처럼 **하나의 인터랙션**.
- 폼/버튼/액션 핸들러 등 자체 상태와 UI를 가짐.

### 4. `widgets/` — 독립적인 UI 블록
- 여러 features/entities를 조합한 **커다란 UI 덩어리** (Header, GNB, KakaoMapViewer, 결과 리스트).
- 한 widget은 한 페이지의 **한 영역**을 책임짐.

### 5. `views/` — 페이지 조립
- 한 라우트(`/`, `/room/[id]`, `/result/[id]`)의 **전체 페이지를 조립**.
- 직접 비즈니스 로직 작성 ❌. 아래 계층의 widget/feature/entity를 **배치**만 함.

### 6. `app/` — 애플리케이션 셸 (Next.js App Router)
- `layout.tsx`, `page.tsx`, `error.tsx`, 글로벌 CSS, Provider(Theme/QueryClient 등) 세팅.
- `page.tsx`는 `views/`의 컴포넌트를 import해서 그대로 반환합니다.

---

## 🚦 Import 규칙 (단방향 의존성)

> **상위 계층은 하위 계층만 import할 수 있습니다.** 반대 방향은 금지.

```
app  →  views  →  widgets  →  features  →  entities  →  shared
```

| from \ to | shared | entities | features | widgets | views | app |
|-----------|:--:|:--:|:--:|:--:|:--:|:--:|
| **shared**   | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **entities** | ✅ | ❌¹ | ❌ | ❌ | ❌ | ❌ |
| **features** | ✅ | ✅ | ❌¹ | ❌ | ❌ | ❌ |
| **widgets**  | ✅ | ✅ | ✅ | ❌¹ | ❌ | ❌ |
| **views**    | ✅ | ✅ | ✅ | ✅ | ❌¹ | ❌ |
| **app**      | ✅ | ✅ | ✅ | ✅ | ✅ | — |

¹ **같은 계층끼리도 직접 import 금지.** 한 단계 위에서 조합하세요.
(예: `features/room-create`가 `features/location-input`을 직접 쓰지 않고, 둘 다 `widgets/room-create-form` 안에서 조합.)

이 규칙은 `.eslintrc.json`의 **eslint-plugin-boundaries**가 자동으로 잡아내며, 위반 시 `npm run lint` / 빌드가 실패합니다.

### 슬라이스의 Public API
한 슬라이스 외부에서의 접근은 **반드시 `index.ts` 경유**:

```ts
// ✅ OK
import { RoomCreateForm } from "@/features/room-create";

// ❌ 내부 파일 직접 import 금지
import { RoomCreateForm } from "@/features/room-create/ui/RoomCreateForm";
```

---

## 절대 경로

`tsconfig.json`의 `paths`로 `@/*` → `./src/*`가 매핑되어 있습니다.

```ts
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/api/axios-instance";
import { Header } from "@/widgets/header";
```

상대 경로 `../../../`는 사용하지 마세요.

---

## 반응형 레이아웃

`app/layout.tsx`는 **Mobile-First** 기반에, 데스크톱에서는 콘텐츠가 과도하게 퍼지지 않도록 **`max-w-md`로 중앙 정렬**(인스타그램 웹 스타일)합니다.

```tsx
<div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-sm">
  {children}
</div>
```

화면을 더 넓히고 싶다면 `max-w-md` → `max-w-lg`로 변경. 페이지 단에서 헤더/푸터를 더하려면 `views/`에서 조합하세요.

---

## Git 브랜치 전략

5주 MVP 동안은 가볍게 갑니다.

- `main` — 배포 가능한 상태만 유지. 직접 push 금지, PR로만 머지.
- `feature/<기능명>` — 새 기능. 예: `feature/room-create`, `feature/kakao-map-viewer`
- `fix/<버그명>` — 버그 수정. 예: `fix/vote-double-click`
- `chore/<작업명>` — 빌드/설정/리팩토링. 예: `chore/eslint-boundaries`

작업 흐름:

1. `main`에서 `feature/xxx` 브랜치 생성
2. 작업 후 PR 생성 → 코드 리뷰 → **squash merge**
3. 커밋 메시지 prefix 권장: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`

---

## 스크립트

| 커맨드 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (3000번 포트) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 (FSD 경계 규칙 포함) |
| `npm run type-check` | TypeScript 타입 검사 |

---

## 슬라이스 작성 패턴 (복붙용 템플릿)

**상황**: 사용자가 어떤 객체(예: `<entity>`)를 보고/만들고/수정한다고 할 때.
- **도메인 모델** → `src/entities/<entity>/`
- **사용자 액션** → `src/features/<action>/`
- **여러 슬라이스를 묶는 UI 블록** → `src/widgets/<block>/`

아래 코드는 진짜 도메인이 정해지면 그대로 베껴 쓰세요.

### 1) `entities/<entity>` — 도메인 모델

```ts
// src/entities/<entity>/model/types.ts
export type <Entity> = { id: string; /* ... */ };
export type Create<Entity>Input = { /* ... */ };
```

```ts
// src/entities/<entity>/api/create-<entity>.ts
import { apiClient } from "@/shared/api/axios-instance";
import type { Create<Entity>Input, <Entity> } from "../model/types";

export async function create<Entity>(input: Create<Entity>Input) {
  const { data } = await apiClient.post<<Entity>>("/<entity>", input);
  return data;
}
```

```ts
// src/entities/<entity>/index.ts  ← Public API. 외부는 이것만 import.
export type { <Entity>, Create<Entity>Input } from "./model/types";
export { create<Entity> } from "./api/create-<entity>";
```

### 2) `features/<action>` — Zustand 스토어 + 폼 컴포넌트

```ts
// src/features/<action>/model/store.ts
import { create } from "zustand";

type State = {
  field: string;
  isSubmitting: boolean;
  error: string | null;
  setField: (v: string) => void;
  setSubmitting: (v: boolean) => void;
  setError: (v: string | null) => void;
  reset: () => void;
};

export const use<Action>Store = create<State>((set) => ({
  field: "",
  isSubmitting: false,
  error: null,
  setField: (field) => set({ field }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  reset: () => set({ field: "", isSubmitting: false, error: null }),
}));
```

```tsx
// src/features/<action>/ui/<Action>Form.tsx
"use client";

import type { FormEvent } from "react";
import { create<Entity> } from "@/entities/<entity>"; // ← features는 entities/shared만 import 가능
import { use<Action>Store } from "../model/store";

export function <Action>Form() {
  const s = use<Action>Store();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    s.setSubmitting(true);
    s.setError(null);
    try {
      await create<Entity>({ /* ... */ });
      s.reset();
    } catch (err) {
      s.setError(err instanceof Error ? err.message : "오류가 발생했어요");
    } finally {
      s.setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {/* ... */}
    </form>
  );
}
```

```ts
// src/features/<action>/index.ts
export { <Action>Form } from "./ui/<Action>Form";
```

### 3) `views/<page>` 에서 조립

```tsx
// src/views/<page>/ui/<Page>View.tsx
import { Header } from "@/widgets/header";
import { <Action>Form } from "@/features/<action>";

export function <Page>View() {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <<Action>Form />
    </main>
  );
}
```

### 4) `app/<route>/page.tsx` 에서 view를 import

```tsx
import { <Page>View } from "@/views/<page>";
export default function Page() { return <<Page>View />; }
```

---

## 새 기능 작업 체크리스트

1. 어떤 계층에 속할지 결정 (액션 → `features/`, 도메인 → `entities/`, UI 블록 → `widgets/`)
2. 슬라이스 폴더 생성 + `ui/`, `model/`, `api/` 세그먼트
3. 외부에 노출할 것만 `index.ts`에 export
4. `npm run lint`로 의존성 방향 위반 0인지 확인 (PR 시 CI가 다시 검사함)
5. PR에서 squash merge
