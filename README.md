# MyPageProject

React·TypeScript·Vite·Supabase 기반의 **개인 블로그·커뮤니티 웹앱**입니다. 토픽(글) 작성·공유, 댓글·좋아요, 팔로우, DM, 실시간 알림을 지원합니다.

**라이브:** [https://my-page.cloud](https://my-page.cloud)

---

## 요구 사항

- **Node.js** 20 이상 권장
- **Yarn** 1.x (`package.json`의 `packageManager` 필드와 동일)

---

## 빠른 시작

```bash
yarn install
# 루트에 .env 생성 후 [환경 변수] 섹션 값 입력
yarn dev
```

| 스크립트 | 설명 |
| --- | --- |
| `yarn dev` | 개발 서버 (Vite) |
| `yarn build` | `tsc -b` 후 프로덕션 빌드 (`dist/`) |
| `yarn preview` | 빌드 결과 미리보기 |
| `yarn lint` | ESLint |

---

## 환경 변수

루트에 `.env`를 두고 다음을 설정합니다.

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
```

Supabase 대시보드 → **Project Settings → API**에서 확인합니다.

---

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 앱 | React 19, TypeScript, Vite 7 |
| 백엔드 | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| 라우팅 | React Router 7 |
| 서버 상태 | TanStack Query v5, `@lukemorales/query-key-factory` |
| 클라이언트 상태 | Zustand |
| 스타일 | Tailwind CSS v4, shadcn/ui(Radix), **BlockNote용 Mantine** |
| 에디터 | BlockNote |
| 폼 | React Hook Form, Zod |
| 기타 | dayjs, lucide-react, sonner, next-themes |

---

## 프로젝트 구조 (요약)

```
src/
├── api/              # Supabase 호출 (auth, topic, comment, like, user, follow, notification, dm)
├── hooks/            # Query 래핑 훅 (useAuth, useTopic, useComment, …)
├── stores/           # Zustand (인증, 검색 UI 등)
├── constants/        # queryKeys, 카테고리
├── types/
├── lib/              # supabase 클라이언트, queryClient, cn()
├── components/
│   ├── common/       # AppHeader, AppEditor, AppCommentSection 등
│   ├── ui/           # shadcn/ui — 상세는 src/components/ui/README.md
│   ├── topics/
│   └── skeleton/
├── pages/            # 홈, 로그인·가입, 토픽 CRUD, DM, 프로필, OAuth 콜백
├── layout.tsx
└── main.tsx
```

---

## 주요 기능

- **인증:** 이메일·비밀번호, Google OAuth (`/auth/callback`)
- **토픽:** 작성·수정·삭제, 임시저장·발행, 공개 범위, 카테고리, 검색
- **상호작용:** 글·댓글 좋아요, 공유(공유 수 반영), 댓글·1단계 답글
- **소셜:** 팔로우, 프로필 수정
- **DM:** 방 목록·메시지, Realtime
- **알림:** Realtime 구독, 타입별 알림(팔로우, 새 글, 댓글, 답글, 좋아요 등)
- **테마:** 라이트/다크 (`next-themes`)

---

## 라우팅

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 (내 글 / 커뮤니티) |
| `/sign-in`, `/sign-up` | 로그인·회원가입 |
| `/auth/callback` | OAuth 콜백 |
| `/topics/:id/create`, `/update`, `/detail` | 글 작성·수정·상세 |
| `/dm` | DM |
| `/profile` | 내 프로필 |

`RootLayout`에서 `AppHeader` + `Outlet`으로 감싸며, `ScrollToTop`으로 라우트 전환 시 스크롤을 초기화합니다.

---

## 배포 (Cloudflare Pages)

| 항목 | 값 |
| --- | --- |
| 빌드 명령 | `yarn build` |
| 출력 디렉터리 | `dist` |
| 환경 변수 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (Production·Preview 필요 시 동일 설정) |

SPA이므로 모든 경로가 `index.html`로 폴백되도록 Pages 설정을 맞춥니다. 값 변경 후에는 재배포가 필요합니다.

---

## Supabase 테이블·RLS (참고 SQL)

### 핵심 테이블

| 테이블 | 설명 |
| --- | --- |
| `user` | 프로필(nickname, profile_image, 약관 등) |
| `topic` | 글(author, title, content, category, thumbnail, status, visibility, share_count 등) |
| `comment` | 댓글·답글(topic_id, parent_id) |
| `topic_like` / `comment_like` | 글·댓글 좋아요 |
| `follow` | 팔로우 관계 |
| `notification` | 알림 |
| `dm_room` / `dm_message` | DM |

### 댓글·좋아요 초기 SQL (예시)

Supabase SQL 에디터에서 실행합니다.

```sql
create table comment (
  id bigint primary key generated always as identity,
  topic_id bigint not null references topic(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_id bigint references comment(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table topic_like (
  id bigint primary key generated always as identity,
  topic_id bigint not null references topic(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(topic_id, user_id)
);

create table comment_like (
  id bigint primary key generated always as identity,
  comment_id bigint not null references comment(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

alter table topic add column if not exists share_count integer default 0;
```

### RLS 정책 (예시)

```sql
alter table comment enable row level security;
create policy "누구나 댓글 읽기" on comment for select using (true);
create policy "로그인 유저 댓글 작성" on comment for insert with check (auth.uid() = author_id);
create policy "본인 댓글 삭제" on comment for delete using (auth.uid() = author_id);

alter table topic_like enable row level security;
create policy "누구나 좋아요 읽기" on topic_like for select using (true);
create policy "로그인 유저 좋아요 추가" on topic_like for insert with check (auth.uid() = user_id);
create policy "본인 좋아요 삭제" on topic_like for delete using (auth.uid() = user_id);

alter table comment_like enable row level security;
create policy "누구나 댓글좋아요 읽기" on comment_like for select using (true);
create policy "로그인 유저 댓글좋아요 추가" on comment_like for insert with check (auth.uid() = user_id);
create policy "본인 댓글좋아요 삭제" on comment_like for delete using (auth.uid() = user_id);

create policy "공유수 업데이트" on topic for update using (true) with check (true);
```

새 테이블은 기본적으로 접근이 막히므로 **반드시 RLS 정책**을 추가합니다. 위는 예시이며, 실제 프로젝트 스키마에 맞게 조정하세요.

---

## 문서 더 보기

- UI 컴포넌트 사용법: [`src/components/ui/README.md`](src/components/ui/README.md)
- API·훅·스토어·쿼리 키 등 장문 레퍼런스는 코드의 `src/api`, `src/hooks`, `src/constants/queryKeys.ts`를 기준으로 확인하면 됩니다.

---

## 라이선스

비공개(`private`) 패키지입니다. 배포·재사용 정책은 저장소 소유자 기준을 따릅니다.
