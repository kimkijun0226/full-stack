# MyPageProject — 개인 블로그 & 커뮤니티 플랫폼

> React + TypeScript + Vite + Supabase 기반의 풀스택 1인 프로젝트.  
> 글 작성·공유(토픽), 댓글·좋아요, 팔로우, DM, 실시간 알림 기능을 포함합니다.

**라이브 사이트:** [https://my-page.cloud](https://my-page.cloud)

---

## 목차

1. [배포 (Cloudflare Pages)](#배포-cloudflare-pages)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [환경 변수 설정](#환경-변수-설정)
5. [Supabase 테이블 구조 & SQL](#supabase-테이블-구조--sql)
6. [API 레이어](#api-레이어)
7. [커스텀 훅](#커스텀-훅)
8. [전역 상태 (Zustand)](#전역-상태-zustand)
9. [쿼리 키 팩토리](#쿼리-키-팩토리)
10. [공통 컴포넌트](#공통-컴포넌트-appxxx)
11. [UI 컴포넌트 (shadcn/ui)](#ui-컴포넌트-shadcnui)
12. [페이지 라우팅](#페이지-라우팅)
13. [만든 과정](#만든-과정)

---

## 배포 (Cloudflare Pages)

프로덕션은 **Cloudflare Pages**에 연결해 빌드·호스팅합니다.

| 항목 | 값 |
| --- | --- |
| 사이트 URL | [https://my-page.cloud](https://my-page.cloud) |
| 프레임워크 프리셋 | Vite (또는 정적 사이트 + 커스텀 빌드) |
| 빌드 명령 | `yarn build` |
| 빌드 출력 디렉터리 | `dist` |
| Node 버전 | Cloudflare 대시보드에서 프로젝트에 맞게 지정 (예: 20) |

**환경 변수:** Cloudflare Pages 프로젝트 → **Settings → Environment variables**에 로컬 `.env`와 동일하게 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`를 **Production**(필요 시 Preview)에 등록합니다. Vite는 빌드 시점에 이 값을 번들에 넣으므로, 값을 바꾼 뒤에는 재배포가 필요합니다.

**커스텀 도메인:** Cloudflare에서 `my-page.cloud` 존을 사용 중이면 Pages 프로젝트 → **Custom domains**에서 해당 도메인을 연결하고, DNS는 Cloudflare 안내에 따라 CNAME 등을 맞춥니다.

**SPA 라우팅:** React Router를 쓰므로 Pages에서 **Single Page Application**용 폴백(모든 경로를 `index.html`로)이 적용되는지 확인합니다. Cloudflare Pages는 기본적으로 이 동작에 맞게 정적 자산을 제공합니다.

---

## 기술 스택

| 분류            | 라이브러리                                               |
| --------------- | -------------------------------------------------------- |
| 프레임워크      | React 19, TypeScript, Vite                               |
| 백엔드/DB       | Supabase (PostgreSQL, Auth, Storage, Realtime)           |
| 서버 상태       | TanStack Query v5 + `@lukemorales/query-key-factory`     |
| 클라이언트 상태 | Zustand (persist 미들웨어 포함)                          |
| 라우팅          | React Router v6                                          |
| UI              | Tailwind CSS v4, shadcn/ui (Radix UI 기반), lucide-react |
| 폼              | React Hook Form + Zod                                    |
| 에디터          | BlockNote (Rich Text)                                    |
| 날짜            | dayjs + relativeTime 플러그인                            |
| 토스트          | sonner                                                   |
| CSS 유틸        | clsx + tailwind-merge (`cn` 유틸)                        |

---

## 프로젝트 구조

```
src/
├── api/                   # Supabase 직접 호출 함수 모음
│   ├── auth.ts            # 로그인, 회원가입, OAuth
│   ├── topic.ts           # 글 CRUD, 이미지 업로드
│   ├── comment.ts         # 댓글, 답글, 댓글 좋아요
│   ├── like.ts            # 글 좋아요, 공유수
│   ├── user.ts            # 유저 프로필 조회/수정
│   ├── follow.ts          # 팔로우/언팔로우
│   ├── notification.ts    # 알림 조회/읽음/생성
│   ├── dm.ts              # DM 방 목록, 메시지
│   └── index.ts           # 배럴 export
│
├── hooks/                 # TanStack Query 래핑 커스텀 훅
│   ├── useAuth.ts         # 로그인/로그아웃/회원가입 뮤테이션
│   ├── useAuthListener.ts # Supabase 세션 변화 감지
│   ├── useTopic.ts        # 글 목록, 상세, CRUD
│   ├── useComment.ts      # 댓글 목록, 작성, 삭제, 좋아요
│   ├── useLike.ts         # 글 좋아요, 공유수 관리
│   ├── useUser.ts         # 내 프로필, 특정 유저 정보
│   ├── useFollow.ts       # 팔로우 상태, 팔로워 수, 토글
│   ├── useNotification.ts # 알림 목록, 읽음, Realtime 구독
│   ├── useDm.ts           # DM 방 목록, 메시지, 실시간
│   ├── useImageUpload.ts  # 이미지 파일 → Supabase Storage URL
│   └── index.ts           # 배럴 export
│
├── stores/
│   └── index.ts           # Zustand 스토어 (useAuthStore, useSearchStore)
│
├── constants/
│   ├── queryKeys.ts       # TanStack Query 키 팩토리
│   └── category.constant.tsx  # 카테고리 13개 정의
│
├── types/
│   ├── topic.type.ts      # Topic 인터페이스, TOPIC_STATUS enum
│   └── index.ts
│
├── lib/
│   ├── supabase.ts        # Supabase 클라이언트 싱글톤
│   ├── queryClient.ts     # TanStack QueryClient (전역 에러 핸들링 포함)
│   └── utils.ts           # cn() 유틸 함수
│
├── components/
│   ├── common/            # 앱 전용 공통 컴포넌트 (App 접두어)
│   │   ├── AppHeader.tsx
│   │   ├── AppHeaderMenu.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── AppFooter.tsx
│   │   ├── AppEditor.tsx
│   │   ├── AppFileUpload.tsx
│   │   ├── AppProfileUpload.tsx
│   │   ├── AppDraftsDialog.tsx
│   │   ├── AppNotificationDropDown.tsx
│   │   ├── AppCommentSection.tsx
│   │   ├── AuthorProfileCard.tsx
│   │   └── index.ts
│   │
│   ├── ui/                # shadcn/ui 원자 컴포넌트
│   │   ├── button.tsx / button-variants.ts
│   │   ├── input.tsx / label.tsx
│   │   ├── field.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── dialog.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── checkbox.tsx
│   │   ├── sonner.tsx
│   │   ├── README.md      # 컴포넌트별 사용법 상세 문서
│   │   └── index.ts
│   │
│   ├── skeleton/          # 로딩 스켈레톤 UI
│   ├── topics/            # 토픽 카드 컴포넌트
│   ├── theme-context.tsx
│   └── theme-provider.tsx
│
├── pages/
│   ├── index.tsx          # 메인 홈 (내 글 / 커뮤니티)
│   ├── sign-in/           # 로그인
│   ├── sign-up/           # 회원가입
│   ├── auth/callback.tsx  # OAuth 리다이렉트 처리
│   ├── topics/[topic_id]/
│   │   ├── create.tsx
│   │   ├── update.tsx
│   │   ├── detail.tsx     # 글 상세 (좋아요, 공유, 댓글)
│   │   └── TopicEditorForm.tsx
│   ├── dm/                # DM 채팅
│   └── profile/           # 내 프로필 설정
│
├── layout.tsx             # 루트 레이아웃 (Header + Outlet + Footer)
└── main.tsx               # 앱 진입점, 라우터, 전역 Provider
```

---

## 환경 변수 설정

루트에 `.env` 파일을 만들고 아래 두 값을 넣습니다.

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
```

> Supabase 대시보드 → Project Settings → API 에서 확인

---

## Supabase 테이블 구조 & SQL

### 핵심 테이블

| 테이블         | 설명                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| `user`         | 유저 프로필 (id, email, nickname, profile_image, 약관 동의)                       |
| `topic`        | 글 (author, title, content, category, thumbnail, status, visibility, share_count) |
| `comment`      | 댓글/답글 (topic_id, author_id, parent_id, content)                               |
| `topic_like`   | 글 좋아요 (topic_id, user_id)                                                     |
| `comment_like` | 댓글 좋아요 (comment_id, user_id)                                                 |
| `follow`       | 팔로우 관계 (follower_id, following_id)                                           |
| `notification` | 알림 (receiver_id, sender_id, type, content, link, is_read)                       |
| `dm_room`      | DM 채팅방 (user1_id, user2_id)                                                    |
| `dm_message`   | DM 메시지 (room_id, sender_id, content, file_url, is_read)                        |

### 댓글/좋아요 테이블 초기 설정 SQL

Supabase SQL 에디터에서 실행합니다.

```sql
-- 댓글 테이블
create table comment (
  id bigint primary key generated always as identity,
  topic_id bigint not null references topic(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_id bigint references comment(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 글 좋아요 테이블
create table topic_like (
  id bigint primary key generated always as identity,
  topic_id bigint not null references topic(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(topic_id, user_id)
);

-- 댓글 좋아요 테이블
create table comment_like (
  id bigint primary key generated always as identity,
  comment_id bigint not null references comment(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- topic 테이블에 공유 수 컬럼 추가
alter table topic add column if not exists share_count integer default 0;
```

### RLS(Row Level Security) 정책

새 테이블은 기본적으로 모든 접근이 차단됩니다. 반드시 정책을 추가해야 합니다.

```sql
-- comment RLS
alter table comment enable row level security;
create policy "누구나 댓글 읽기" on comment for select using (true);
create policy "로그인 유저 댓글 작성" on comment for insert with check (auth.uid() = author_id);
create policy "본인 댓글 삭제" on comment for delete using (auth.uid() = author_id);

-- topic_like RLS
alter table topic_like enable row level security;
create policy "누구나 좋아요 읽기" on topic_like for select using (true);
create policy "로그인 유저 좋아요 추가" on topic_like for insert with check (auth.uid() = user_id);
create policy "본인 좋아요 삭제" on topic_like for delete using (auth.uid() = user_id);

-- comment_like RLS
alter table comment_like enable row level security;
create policy "누구나 댓글좋아요 읽기" on comment_like for select using (true);
create policy "로그인 유저 댓글좋아요 추가" on comment_like for insert with check (auth.uid() = user_id);
create policy "본인 댓글좋아요 삭제" on comment_like for delete using (auth.uid() = user_id);

-- topic share_count update
create policy "공유수 업데이트" on topic for update using (true) with check (true);
```

---

## API 레이어

`src/api/` 는 순수 Supabase 호출 함수만 담습니다. React에 의존하지 않아 독립적으로 테스트 가능합니다.

### `auth.ts`

| 함수                          | 설명                            |
| ----------------------------- | ------------------------------- |
| `signInWithPassword(payload)` | 이메일/패스워드 로그인          |
| `signUp(payload)`             | 회원가입 + `user` 테이블 upsert |
| `signInWithGoogle()`          | Google OAuth 리다이렉트         |
| `signOut()`                   | 로그아웃                        |
| `changePassword(newPassword)` | 비밀번호 변경                   |

**타입**

- `SignInPayload` — `{ email, password }`
- `SignUpPayload` — `{ email, password, nickname?, profile_image?, service_agreed, privacy_agreed, marketing_agreed }`
- `AuthUser` — `{ id, email, role }`
- `SignUpResult` — `{ authUser, profile }`

---

### `topic.ts`

| 함수                                        | 설명                                        |
| ------------------------------------------- | ------------------------------------------- |
| `getMyPublishedTopics(authorId, category?)` | 내가 발행한 글 목록                         |
| `getCommunityTopics(category?)`             | 전체 공개 글 목록 (visibility=PUBLIC)       |
| `getTopicId(id)`                            | 글 단건 조회                                |
| `getDraftTopics(userId)`                    | 임시저장 목록                               |
| `createTopic(payload)`                      | 글 생성                                     |
| `updateTopic(id, payload)`                  | 글 수정                                     |
| `deleteTopic(id)`                           | 글 삭제 (Storage 이미지 포함)               |
| `uploadThumbnail(file)`                     | 썸네일 이미지 → Supabase Storage → URL 반환 |
| `searchTopics(query, category?)`            | 제목/닉네임/이메일 풀텍스트 검색            |

**타입**

- `Topic` — `{ id, created_at, author, title, content, category, thumbnail, status, visibility, share_count? }`
- `TOPIC_STATUS` — `enum { TEMP="temp", PUBLISH="publish" }`
- `TOPIC_VISIBILITY` — `"PRIVATE" | "PUBLIC"`

---

### `comment.ts`

| 함수                                   | 설명                                          |
| -------------------------------------- | --------------------------------------------- |
| `getComments(topicId, currentUserId?)` | 댓글 목록 조회 (작성자 정보 + 좋아요 수 포함) |
| `createComment(payload)`               | 댓글/답글 작성                                |
| `deleteComment(id)`                    | 댓글 삭제                                     |
| `likeComment(commentId, userId)`       | 댓글 좋아요                                   |
| `unlikeComment(commentId, userId)`     | 댓글 좋아요 취소                              |

**타입**

```ts
interface Comment {
  id: number;
  topic_id: number;
  author_id: string;
  parent_id: number | null; // null이면 최상위, 숫자면 답글
  content: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  author: { id: string; nickname: string; profile_image: string | null } | null;
}
```

> `getComments` 내부에서 작성자 정보(`user` 테이블)와 좋아요(`comment_like` 테이블)를 **한 번의 호출 사이클**에 일괄 조회하여 N+1 문제를 방지합니다.

---

### `like.ts`

| 함수                                 | 설명                                    |
| ------------------------------------ | --------------------------------------- |
| `getTopicLikeInfo(topicId, userId?)` | 좋아요 수 + 내가 좋아요 했는지 + 공유수 |
| `likeTopic(topicId, userId)`         | 글 좋아요                               |
| `unlikeTopic(topicId, userId)`       | 글 좋아요 취소                          |
| `incrementShareCount(topicId)`       | 공유수 +1                               |

**타입**

```ts
interface TopicLikeInfo {
  count: number;
  isLiked: boolean;
  shareCount: number;
}
```

---

### `user.ts`

| 함수                            | 설명                                      |
| ------------------------------- | ----------------------------------------- |
| `getUserInfo(id)`               | 유저 프로필 단건 조회                     |
| `searchUsers(query, excludeId)` | 닉네임/이메일 유저 검색 (DM 시작 시 사용) |
| `updateUserInfo(id, data)`      | 닉네임/프로필 이미지 수정                 |
| `deleteUserData(id)`            | 유저 데이터 삭제 (탈퇴)                   |

---

### `follow.ts`

| 함수                            | 설명             |
| ------------------------------- | ---------------- |
| `follow(followingId)`           | 팔로우           |
| `unfollow(followingId)`         | 언팔로우         |
| `checkIsFollowing(followingId)` | 팔로우 여부 확인 |
| `getFollowerCount(userId)`      | 팔로워 수        |
| `getFollowingCount(userId)`     | 팔로잉 수        |

---

### `notification.ts`

| 함수                          | 설명                                         |
| ----------------------------- | -------------------------------------------- |
| `getNotifications()`          | 내 알림 목록 (최신순)                        |
| `getUnreadCount()`            | 읽지 않은 알림 수                            |
| `markAsRead(id)`              | 단건 읽음 처리                               |
| `markAllAsRead()`             | 전체 읽음 처리                               |
| `createNotification(payload)` | 알림 생성 (sender === receiver 시 자동 스킵) |

**알림 타입**

| NotificationType | 발생 시점                          |
| ---------------- | ---------------------------------- |
| `follow`         | 누군가 나를 팔로우할 때            |
| `new_post`       | 내가 팔로우한 사람이 새 글 작성 시 |
| `comment`        | 내 글에 댓글이 달렸을 때           |
| `reply`          | 내 댓글에 답글이 달렸을 때         |
| `topic_like`     | 내 글에 좋아요가 눌렸을 때         |
| `comment_like`   | 내 댓글에 좋아요가 눌렸을 때       |

---

### `dm.ts`

| 함수                                   | 설명                             |
| -------------------------------------- | -------------------------------- |
| `getRooms(myId)`                       | 내 DM 방 목록 (상대방 정보 포함) |
| `getMessages(roomId)`                  | 특정 방의 메시지 목록            |
| `getOrCreateRoom(myId, otherId)`       | DM 방 생성 또는 기존 방 ID 반환  |
| `sendMessage(payload)`                 | 메시지 전송                      |
| `markRoomMessagesAsRead(roomId, myId)` | 방 내 메시지 읽음 처리           |
| `getUnreadCount(myId)`                 | 전체 안읽은 DM 수                |

---

## 커스텀 훅

`src/hooks/` 는 TanStack Query를 래핑하여 컴포넌트에서 데이터를 쉽게 사용할 수 있게 합니다.  
모든 훅은 `src/hooks/index.ts` 에서 export됩니다.

---

### `useAuth` — `useAuth.ts`

로그인·로그아웃·회원가입 뮤테이션을 제공합니다.

```ts
const { signIn, signUp, googleSignIn, signOut } = useAuth();

signIn.mutate({ email, password });
signUp.mutate({ email, password, nickname, ... });
googleSignIn.mutate();
signOut.mutate();
```

성공 시 `useAuthStore`에 유저 정보를 저장하고 홈으로 navigate합니다.

---

### `useAuthListener` — `useAuthListener.ts`

앱 마운트 시 `supabase.auth.onAuthStateChange`를 구독해 세션이 복원/변경될 때 자동으로 `useAuthStore`를 업데이트합니다. `layout.tsx`에서 한 번만 호출합니다.

---

### `useTopic` / `useTopicDetail` / `useMyTopics` / `useCommunityTopics` / `useSearchTopics`

**`useTopicDetail(id)`** — 글 단건 조회

```ts
const { data: topic } = useTopicDetail(id);
```

**`useMyTopics(category?)`** — 내가 발행한 글 목록

```ts
const { data: topics } = useMyTopics("programming");
```

**`useCommunityTopics(category?)`** — 커뮤니티 전체 공개 글

```ts
const { data: topics } = useCommunityTopics();
```

**`useSearchTopics(query, category?)`** — 실시간 검색 (debounce는 컴포넌트에서 처리)

```ts
const { data: results } = useSearchTopics("리액트", "programming");
```

**`useTopic()`** — 글 생성/수정/삭제 뮤테이션 + 임시저장/발행 목록 포함

```ts
const { createTopic, updateTopic, deleteTopic, publishedTopics, draftTopics } = useTopic();
createTopic.mutate(payload);
```

---

### `useComment` — `useComment.ts`

| 훅                                          | 설명                                       |
| ------------------------------------------- | ------------------------------------------ |
| `useComments(topicId)`                      | 댓글 목록 조회 (작성자 정보 + 좋아요 포함) |
| `useCreateComment(topicId, topicAuthorId?)` | 댓글/답글 작성 + 알림 자동 발송            |
| `useDeleteComment(topicId)`                 | 댓글 삭제                                  |
| `useToggleCommentLike(topicId)`             | 댓글 좋아요/취소 + 알림 자동 발송          |

```ts
// 댓글 목록
const { data: comments } = useComments(topicId);

// 댓글 작성 (topicAuthorId 넘기면 알림 자동 발송)
const createComment = useCreateComment(topicId, topic?.author);
createComment.mutate({ content: "좋은 글이에요!" });

// 답글 작성
createComment.mutate({ content: "감사합니다!", parent_id: parentCommentId });

// 좋아요 토글
const toggleLike = useToggleCommentLike(topicId);
toggleLike.mutate({ commentId, isLiked: comment.is_liked, commentAuthorId: comment.author?.id });
```

> 성공 시 `commentKeys.list(topicId)`를 invalidate하여 목록을 자동 갱신합니다.

---

### `useLike` — `useLike.ts`

| 훅                                            | 설명                                             |
| --------------------------------------------- | ------------------------------------------------ |
| `useTopicLike(topicId)`                       | 글 좋아요 수 + 내가 좋아요 여부 + 공유수 조회    |
| `useToggleTopicLike(topicId, topicAuthorId?)` | 글 좋아요/취소 + 알림 자동 발송                  |
| `useShareTopic(topicId)`                      | Web Share API / 클립보드 복사 + 공유수 즉시 반영 |

```ts
const { data: likeInfo } = useTopicLike(topicId);
// { count: 12, isLiked: true, shareCount: 5 }

const toggleLike = useToggleTopicLike(topicId, topic?.author);
toggleLike.mutate(likeInfo?.isLiked ?? false);

const shareTopic = useShareTopic(topicId);
shareTopic.mutate(window.location.href, {
  onSuccess: () => toast.success("링크가 복사되었습니다!"),
});
```

> `useShareTopic`은 성공 시 `setQueryData`로 캐시를 직접 업데이트해 공유수를 즉시 반영합니다.

---

### `useUser` / `useUserInfo`

```ts
// 현재 로그인한 유저 정보
const { userInfo } = useUser();

// 특정 유저 정보 (작성자 프로필 카드 등)
const { userInfo: authorInfo } = useUserInfo(topic?.author);
```

---

### `useFollow`

```ts
const { isFollowing, followerCount, toggleFollow, isPending } = useFollow(targetUserId);
```

---

### `useNotification`

```ts
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
```

내부적으로 `supabase.channel` Realtime 구독을 설정하여 새 알림 INSERT 시 자동으로 쿼리를 invalidate하고 sonner 토스트를 띄웁니다.

---

### `useImageUpload`

```ts
const { upload } = useImageUpload();
// File이면 Supabase Storage 업로드 후 URL 반환
// string이면 그대로, null이면 null
upload.mutate(imageFile, {
  onSuccess: (url) => setValue("thumbnail", url),
});
```

---

### `useDm`

| 훅                      | 설명                                     |
| ----------------------- | ---------------------------------------- |
| `useDmRooms()`          | DM 방 목록                               |
| `useDmMessages(roomId)` | 특정 방 메시지 목록 (Realtime 구독 포함) |
| `useGetOrCreateRoom()`  | DM 방 생성/조회 뮤테이션                 |
| `useSendMessage()`      | 메시지 전송 뮤테이션                     |
| `useDmUnreadCount()`    | 전체 안읽은 DM 수                        |

---

## 전역 상태 (Zustand)

`src/stores/index.ts` 에 두 개의 스토어가 있습니다.

### `useAuthStore`

```ts
const { user, setUser, reset } = useAuthStore();
// user: { id, email, role } | null
// reset(): 로그아웃 + Supabase 세션 삭제 + localStorage 제거
```

`localStorage`에 `auth-storage` 키로 persist 됩니다 (새로고침 후에도 로그인 유지).

### `useSearchStore`

```ts
const { searchOpen, setSearchOpen } = useSearchStore();
// AppHeader에서 검색 패널 열림/닫힘 상태 관리
```

---

## 쿼리 키 팩토리

`src/constants/queryKeys.ts` 는 `@lukemorales/query-key-factory`로 타입 안전한 쿼리 키를 관리합니다.

```ts
// 글 목록
queryKey: topicKeys.communityList("programming").queryKey;

// 글 상세
queryKey: topicKeys.detail(id).queryKey;

// 댓글 목록
queryKey: commentKeys.list(topicId).queryKey;

// 글 좋아요 정보
queryKey: likeKeys.topic(topicId).queryKey;

// 유저 정보
queryKey: userKeys.info(userId).queryKey;
```

---

## 공통 컴포넌트 (`App···`)

`src/components/common/` 의 컴포넌트들은 앱 전체에서 재사용되는 레이아웃/도메인 컴포넌트입니다.

| 컴포넌트                  | 역할                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| `AppHeader`               | 상단 헤더 (로고, 검색, DM/홈 전환, 알림, 프로필 메뉴)               |
| `AppHeaderMenu`           | 헤더 슬라이드 사이드 메뉴 (라이트/다크 모드, 프로필 편집, 로그아웃) |
| `AppSidebar`              | 카테고리 필터 사이드바                                              |
| `AppFooter`               | 하단 푸터                                                           |
| `AppEditor`               | BlockNote 기반 Rich Text 에디터 (작성 모드 / 읽기 전용 모드)        |
| `AppFileUpload`           | 파일/이미지 업로드 영역 (드래그 앤 드롭 지원)                       |
| `AppProfileUpload`        | 프로필 이미지 업로드 (원형 크롭 미리보기)                           |
| `AppDraftsDialog`         | 임시저장 목록 다이얼로그                                            |
| `AppNotificationDropDown` | 알림 드롭다운 (타입별 아이콘, 실시간 뱃지)                          |
| `AppCommentSection`       | 댓글 + 답글 섹션 (YouTube식 1단계 답글)                             |
| `AuthorProfileCard`       | 작성자 프로필 카드 (팔로우 버튼, DM 버튼 포함)                      |

### `AppCommentSection` 상세

```tsx
<AppCommentSection topicId={topicId} topicAuthorId={topic?.author} />
```

- 최상위 댓글 목록 + 각 댓글 아래 1단계 답글
- 답글 버튼 클릭 시 인라인 입력 폼 표시
- 본인 댓글만 삭제 버튼 노출
- 댓글·답글 작성 시 알림 자동 발송 (`topicAuthorId` 필요)
- `Ctrl+Enter` / `Cmd+Enter` 단축키로 등록

### `AppNotificationDropDown` 알림 타입별 아이콘

| 타입           | 아이콘        | 색상     |
| -------------- | ------------- | -------- |
| `follow`       | UserPlus      | 에메랄드 |
| `new_post`     | FileText      | 기본     |
| `comment`      | MessageCircle | 파란색   |
| `reply`        | MessageCircle | 인디고   |
| `topic_like`   | Heart         | 로즈     |
| `comment_like` | Heart         | 핑크     |

---

## UI 컴포넌트 (shadcn/ui)

상세 사용법은 **[src/components/ui/README.md](src/components/ui/README.md)** 를 참고하세요.

| 컴포넌트             | 파일               |
| -------------------- | ------------------ |
| Button               | `button.tsx`       |
| Input                | `input.tsx`        |
| Label                | `label.tsx`        |
| Field (폼 필드 래퍼) | `field.tsx`        |
| Select               | `select.tsx`       |
| Card                 | `card.tsx`         |
| Badge                | `badge.tsx`        |
| Separator            | `separator.tsx`    |
| Skeleton             | `skeleton.tsx`     |
| Dialog               | `dialog.tsx`       |
| AlertDialog          | `alert-dialog.tsx` |
| Tabs                 | `tabs.tsx`         |
| Checkbox             | `checkbox.tsx`     |
| Toaster (sonner)     | `sonner.tsx`       |

---

## 페이지 라우팅

```
/                   → pages/index.tsx       (홈: 내 글 / 커뮤니티)
/sign-in            → pages/sign-in/        (로그인)
/sign-up            → pages/sign-up/        (회원가입)
/auth/callback      → pages/auth/callback   (Google OAuth 콜백)
/topics/:id/create  → topics/create.tsx     (글 작성)
/topics/:id/update  → topics/update.tsx     (글 수정)
/topics/:id/detail  → topics/detail.tsx     (글 상세 + 좋아요 + 댓글)
/dm                 → pages/dm/             (DM 채팅)
/profile            → pages/profile/        (내 프로필 설정)
```

모든 페이지는 `RootLayout`(AppHeader + Outlet + AppFooter) 안에서 렌더링됩니다.  
라우트 전환 시 `ScrollToTop` 컴포넌트가 자동으로 상단으로 스크롤합니다.

---

## 만든 과정

### 1단계 — 프로젝트 초기 설정

Vite + React + TypeScript 템플릿으로 시작했습니다. Tailwind CSS v4와 shadcn/ui를 설정하고, Supabase 프로젝트를 생성해 환경 변수로 연결했습니다. TanStack Query와 Zustand를 전역 Provider로 등록했습니다.

### 2단계 — 인증 시스템

Supabase Auth를 이용해 이메일/패스워드 로그인과 Google OAuth를 구현했습니다. OAuth의 경우 콜백 페이지에서 세션을 받아 `user` 테이블에 `upsert`하는 방식으로 처리했습니다. 새로고침 후에도 로그인 상태가 유지되도록 Zustand persist 미들웨어를 사용했고, `useAuthListener`로 Supabase 세션 변화를 감지합니다.

### 3단계 — 글(토픽) CRUD

BlockNote 에디터를 통해 Rich Text 글을 작성하고 JSON으로 Supabase에 저장합니다. 글에는 임시저장/발행 상태 구분이 있고, 전체공개/나만보기 visibility를 따로 설정할 수 있습니다. 썸네일 이미지는 Supabase Storage에 업로드 후 URL을 DB에 저장합니다.

### 4단계 — 카테고리 & 검색

13개 카테고리를 정의하고 사이드바 필터로 활용했습니다. 검색은 `useSearchStore`로 패널 열림 상태를 관리하고, Supabase의 `ilike` 쿼리로 제목/닉네임/이메일을 동시에 검색합니다. 컴포넌트에서 300ms debounce를 적용했습니다.

### 5단계 — 팔로우 & 프로필

작성자 프로필 카드에서 팔로우/언팔로우 토글과 팔로워 수를 실시간으로 확인할 수 있습니다. `/profile` 페이지에서 닉네임·프로필 이미지 수정, 비밀번호 변경, 계정 탈퇴가 가능합니다. Google 계정은 `app_metadata.provider === "google"` 으로 OAuth 유저를 판별해 비밀번호 변경 섹션을 숨깁니다.

### 6단계 — DM

`dm_room`과 `dm_message` 테이블로 1:1 채팅을 구현했습니다. 메시지는 Supabase Realtime을 통해 실시간으로 수신됩니다. 파일/이미지도 첨부할 수 있습니다.

### 7단계 — 실시간 알림

`notification` 테이블에 Supabase Realtime을 구독해 새 알림 INSERT 시 즉시 드롭다운과 뱃지가 갱신됩니다. `createNotification` 함수는 sender와 receiver가 동일한 경우 자동으로 스킵합니다.

### 8단계 — 댓글·좋아요·공유

글 상세 페이지에 세 가지 기능을 추가했습니다.

- **좋아요**: `topic_like` 테이블 + 낙관적 업데이트 (즉시 UI 반영)
- **공유**: Web Share API 우선 시도, 미지원 시 클립보드 복사. 성공 시 `setQueryData`로 공유수 즉시 반영
- **댓글/답글**: `AppCommentSection` 컴포넌트로 YouTube식 1단계 대댓글 구현. 작성자 정보와 좋아요 수를 `getComments`에서 N+1 없이 일괄 조회. 댓글/답글 작성 및 댓글 좋아요 시 알림 자동 발송

### 9단계 — 라이트/다크 모드

`next-themes`의 `ThemeProvider`를 사용합니다. Tailwind의 시맨틱 토큰(`text-foreground`, `bg-card`, `border-border` 등)을 일관되게 사용해 모드 전환 시 자동으로 색상이 변경됩니다. 하드코딩된 `bg-[#1a1a1a]`, `text-white/70` 같은 값들을 순차적으로 시맨틱 토큰으로 교체했습니다.

---

## 개발 서버 실행

```bash
yarn install
yarn dev
```

빌드:

```bash
yarn build
```

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
