# DevMeet

학생 및 예비 개발자가 스터디·사이드 프로젝트의 팀원을 모집하고 참여할 수 있는 웹 서비스입니다.

> **기술 스택:** Next.js + MongoDB  
> **개발 목표:** CRUD, 인증(Authentication), 권한 검증(Authorization), 모집 상태 관리, 참여 신청 및 중복 신청 방지

---

## 1. 프로젝트 소개

DevMeet은 프로젝트나 스터디를 함께할 팀원을 찾는 학생, 취업 준비생, 신입 개발자가 원하는 조건의 모임을 빠르게 찾고 모집할 수 있도록 돕는 서비스입니다.

대형 커뮤니티나 오픈채팅에서는 모집글이 쉽게 묻히고, 기술 스택·모집 인원·진행 방식·모집 상태 등의 정보를 한눈에 확인하기 어렵다는 문제를 해결하는 것을 목표로 합니다.

### 핵심 기능

- 회원가입 / 로그인
- 스터디·프로젝트 모집글 목록 조회
- 모집글 작성
- 모집글 수정 / 삭제
- 모집 중 / 모집 완료 상태 관리
- 참여 신청
- 동일 모집글 중복 신청 방지

### 추가 기능

시간이 남을 경우 다음 기능을 추가합니다.

- 키워드 검색
- 기술 스택 / 진행 방식 필터링
- 북마크
- 댓글

### 이번 프로젝트에서 제외

- 실시간 채팅
- AI 추천
- 복잡한 승인 / 거절 시스템
- 결제 및 유료 스터디 기능

---

## 2. 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js Route Handlers |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Validation | Zod |
| Password | bcryptjs |
| HTTP 통신 | Fetch API |
| Styling | CSS Modules 또는 전역 CSS |
| 개발 언어 | TypeScript |
| DB 관리 | MongoDB Atlas / MongoDB Compass |
| 패키지 관리 | npm |

### 기술 스택을 이렇게 구성한 이유

이번 프로젝트는 **Next.js 하나로 프론트엔드와 백엔드 API를 함께 구성**합니다.

기존 설계에서 Express 서버를 사용하는 내용이 일부 있었지만, 최종 개발 스택을 `Next.js + MongoDB`로 정했기 때문에 별도의 Express 서버는 사용하지 않습니다.

API는 Next.js의 Route Handler를 사용하여 다음과 같이 구현합니다.

```text
Client
  ↓
Next.js
  ├── UI / Page
  └── API Route Handler
          ↓
      Mongoose
          ↓
      MongoDB
```

---

## 3. 프로젝트 구조

```text
devmeet/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── page.tsx              # 로그인 / 회원가입
│   │
│   ├── posts/
│   │   ├── page.tsx                  # 모집글 목록
│   │   ├── new/
│   │   │   └── page.tsx              # 모집글 작성
│   │   └── [id]/
│   │       ├── page.tsx              # 모집글 상세
│   │       └── edit/
│   │           └── page.tsx          # 모집글 수정
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts          # 회원가입 API
│   │   │   └── login/
│   │   │       └── route.ts           # 로그인 API
│   │   │
│   │   └── posts/
│   │       ├── route.ts               # GET 목록 / POST 작성
│   │       └── [id]/
│   │           ├── route.ts           # GET 상세 / PATCH 수정 / DELETE 삭제
│   │           └── apply/
│   │               └── route.ts       # POST 참여 신청
│   │
│   ├── layout.tsx
│   ├── page.tsx                       # 서비스 메인 진입점
│   └── globals.css
│
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   └── posts/
│       ├── PostCard.tsx
│       ├── PostList.tsx
│       ├── PostForm.tsx
│       ├── PostDetail.tsx
│       └── ApplyModal.tsx
│
├── models/
│   ├── User.ts
│   ├── Post.ts
│   └── Application.ts
│
├── lib/
│   ├── mongodb.ts                     # MongoDB 연결
│   ├── auth.ts                         # JWT 생성 / 검증
│   └── validation/
│       ├── auth.ts                     # 인증 관련 Zod Schema
│       └── post.ts                     # 모집글 관련 Zod Schema
│
├── middleware.ts                       # 인증 / 접근 제어
│
├── types/
│   ├── user.ts
│   ├── post.ts
│   └── application.ts
│
├── public/
│   └── images/
│
├── .env.local                          # 환경 변수 (Git에 업로드 금지)
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. 화면 구성

### MVP 필수 화면

1. **메인 화면**
   - 모집글 목록
   - 모집 상태
   - 진행 방식
   - 기술 스택
   - 작성자 닉네임
   - 작성일

2. **로그인 / 회원가입**
   - 로그인과 회원가입을 하나의 인증 화면에서 Tab 방식으로 구성

3. **모집글 작성**
   - 제목
   - 모집 인원
   - 진행 방식
   - 기술 스택
   - 상세 내용

4. **모집글 상세**
   - 모집글 전체 내용
   - 작성자 정보
   - 모집 상태
   - 참여 신청
   - 작성자용 수정 / 삭제 / 모집 완료 기능

5. **모집글 수정**
   - 기존 모집글 데이터를 불러와 수정

### 추가 화면

- 마이페이지
- 검색 / 필터링 결과 화면

참여 신청 완료 페이지는 별도로 만들지 않고 상세 화면에서 Modal과 Toast로 처리합니다.

---

## 5. MongoDB 데이터 모델

### User

회원 정보와 인증에 필요한 데이터를 저장합니다.

```ts
{
  _id: ObjectId,
  email: string,
  password: string,
  nickname: string,
  createdAt: Date,
  updatedAt: Date
}
```

> 비밀번호는 평문으로 저장하지 않고 `bcryptjs`로 해시하여 저장합니다.

---

### Post

스터디·프로젝트 모집글을 저장합니다.

```ts
{
  _id: ObjectId,
  title: string,
  content: string,
  capacity: number,
  techStack: string[],
  meetingType: "ONLINE" | "OFFLINE" | "HYBRID",
  status: "RECRUITING" | "COMPLETED",
  contactLink?: string,
  author: ObjectId,       // Ref: User
  createdAt: Date,
  updatedAt: Date
}
```

### 필수 Field

- `title`
- `content`
- `capacity`
- `author`

### 선택 Field

- `techStack`
- `contactLink`
- `meetingType`

### 서버에서 자동 생성 / 관리

- `_id`
- `status` → 기본값 `RECRUITING`
- `createdAt`
- `updatedAt`

`applicantCount` 또는 `currentApplicants`를 Post에 별도로 저장하지 않습니다. 신청자 정보는 `Application` 컬렉션을 기준으로 관리합니다.

---

### Application

어떤 사용자가 어떤 모집글에 신청했는지를 저장합니다.

```ts
{
  _id: ObjectId,
  postId: ObjectId,       // Ref: Post
  applicant: ObjectId,   // Ref: User
  message: string,
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  appliedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

중복 신청 방지를 위해 다음 조합을 기준으로 Unique Index를 설정하는 것을 권장합니다.

```text
applicant + postId
```

---

## 6. Collection 관계

```text
User (1)
 │
 ├────< Post (N)
 │
 └────< Application (N)
                 >──── Post (1)
```

즉,

```text
User 1 : N Post
User 1 : N Application
Post 1 : N Application
```

사용자와 모집글 사이의 참여 관계는 `Application`을 중간에 두어 관리합니다.

```text
User
  ↓
Application
  ↓
Post
```

### Reference를 사용하는 이유

`User`와 `Post`의 관계는 MongoDB의 Embedded 방식보다 Reference 방식으로 관리합니다.

```ts
author: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

사용자 정보가 변경되었을 때 여러 Post 문서의 사용자 정보를 함께 수정할 필요가 없으며, 한 사용자가 작성하는 게시글이 많아져도 User Document가 계속 커지는 문제를 피할 수 있습니다.

---

## 7. API 명세

### 인증

| Method | URL | 로그인 |
|---|---|---|
| POST | `/api/auth/register` | X |
| POST | `/api/auth/login` | X |

### 모집글

| Method | URL | 로그인 | 설명 |
|---|---|---:|---|
| GET | `/api/posts` | X | 전체 모집글 조회 |
| GET | `/api/posts/:id` | X | 모집글 상세 조회 |
| POST | `/api/posts` | O | 모집글 작성 |
| PATCH | `/api/posts/:id` | O | 모집글 수정 / 상태 변경 |
| DELETE | `/api/posts/:id` | O | 모집글 삭제 |

### 참여 신청

| Method | URL | 로그인 | 설명 |
|---|---|---:|---|
| POST | `/api/posts/:id/apply` | O | 참여 신청 |

---

## 8. API Request 예시

### 모집글 작성

`POST /api/posts`

#### Header

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body

```json
{
  "title": "React 스터디 모집",
  "content": "React와 Next.js를 함께 공부할 팀원을 모집합니다.",
  "capacity": 4,
  "techStack": ["React", "Next.js", "TypeScript"],
  "meetingType": "ONLINE"
}
```

`author`는 Request Body에 넣지 않습니다.

서버에서 JWT를 검증하여 로그인한 사용자의 ID를 가져와 `author`에 저장합니다.

---

### 참여 신청

`POST /api/posts/:id/apply`

#### Header

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body

```json
{
  "message": "React와 Next.js를 공부하고 있어 함께 성장하고 싶습니다."
}
```

#### 성공 Response

```json
{
  "success": true,
  "message": "참여 신청이 완료되었습니다.",
  "data": {
    "_id": "65a1b2c3...",
    "postId": "65a1b2c3...",
    "status": "PENDING"
  }
}
```

---

## 9. HTTP 상태 코드

| 상태 코드 | 상황 |
|---|---|
| `200 OK` | 조회 / 수정 성공 |
| `201 Created` | 회원가입, 모집글 작성, 참여 신청 성공 |
| `400 Bad Request` | 잘못된 입력값 |
| `401 Unauthorized` | 로그인하지 않았거나 JWT가 유효하지 않음 |
| `403 Forbidden` | 작성자가 아닌 사용자의 수정 / 삭제 요청 |
| `404 Not Found` | 존재하지 않는 게시글 |
| `409 Conflict` | 동일 모집글 중복 신청 |
| `500 Internal Server Error` | 서버 내부 오류 |

---

## 10. Validation

### Client

사용자에게 빠른 피드백을 제공하기 위해 다음을 검사합니다.

- 필수 입력값 여부
- 제목 / 본문 최소·최대 글자 수
- 모집 인원수가 숫자인지 확인
- 모집 인원수가 1 이상인지 확인

### Server

클라이언트 검증은 우회할 수 있으므로 서버에서도 반드시 검증합니다.

- JWT 유효성 및 만료 여부
- Request Body 타입
- 제목 / 본문 공백 문자열 검사
- `capacity >= 1`
- 허용된 `status` 값인지 확인
- 허용된 `meetingType` 값인지 확인
- 악의적인 HTML / Script 입력에 대한 Sanitization

### Database

Mongoose Schema에서도 데이터 무결성을 보장합니다.

```text
required
min
enum
unique index
```

---

## 11. 인증 및 권한

### 인증(Authentication)

로그인이 필요한 API는 JWT를 사용합니다.

```text
로그인
  ↓
JWT 발급
  ↓
클라이언트 요청
  ↓
Authorization Header
  ↓
JWT 검증
  ↓
사용자 식별
```

### 권한(Authorization)

게시글 수정 / 삭제는 로그인만 했다고 허용하지 않습니다.

```text
요청 사용자 ID
      ↓
Post.author와 비교
      ↓
일치 → 수정 / 삭제 허용
불일치 → 403 Forbidden
```

특히 다음 API에서 권한 검사가 중요합니다.

```text
PATCH /api/posts/:id
DELETE /api/posts/:id
```

---

## 12. 참여 신청 처리 흐름

```text
[참여 신청하기 클릭]
          ↓
[POST /api/posts/:id/apply]
          ↓
[JWT 인증]
          ↓
[게시글 존재 여부 확인]
          ↓
[모집 상태 확인]
          ↓
[중복 신청 여부 확인]
          ↓
[Application 생성]
          ↓
[201 Created]
          ↓
[Toast 출력]
          ↓
[신청 완료 버튼 비활성화]
```

중복 신청이 확인되면:

```text
409 Conflict
```

를 반환합니다.

---

## 13. 설치할 패키지

### 프로젝트 생성

```bash
npx create-next-app@latest devmeet
```

권장 선택:

```text
TypeScript       Yes
ESLint           Yes
Tailwind CSS     No 또는 팀 결정
src/ directory   Yes
App Router       Yes
Turbopack        Yes
Import alias     @/*
```

---

### 필수 패키지

```bash
npm install mongoose bcryptjs jose zod
```

| 패키지 | 용도 |
|---|---|
| `mongoose` | MongoDB ODM 및 Schema 관리 |
| `bcryptjs` | 비밀번호 해시 |
| `jose` | JWT 생성 및 검증 |
| `zod` | Request 데이터 Validation |

### 개발용 타입 패키지

```bash
npm install -D @types/bcryptjs
```

### 선택 패키지

UI 및 폼 구현 방식에 따라 다음을 추가할 수 있습니다.

```bash
npm install react-hook-form
```

```bash
npm install lucide-react
```

| 패키지 | 용도 |
|---|---|
| `react-hook-form` | 복잡한 폼 상태 및 Validation 처리 |
| `lucide-react` | 아이콘 |

> API 통신은 기본 `fetch`를 사용하므로 Axios는 MVP에서 필수가 아닙니다.

---

## 14. 한 번에 설치하기

```bash
npm install mongoose bcryptjs jose zod react-hook-form lucide-react
npm install -D @types/bcryptjs
```

---

## 15. 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/devmeet
JWT_SECRET=your-secret-key
```

`.env.example`도 만들어서 필요한 환경 변수의 이름만 공유합니다.

```env
MONGODB_URI=
JWT_SECRET=
```

### 주의

`.env.local`에는 실제 MongoDB 비밀번호와 JWT Secret이 들어가므로 GitHub에 업로드하면 안 됩니다.

`.gitignore`에 다음을 포함합니다.

```gitignore
.env
.env.local
.env*.local
```

---

## 16. MongoDB 연결

`lib/mongodb.ts`에서 Mongoose 연결을 관리합니다.

```text
Next.js API
    ↓
lib/mongodb.ts
    ↓
Mongoose
    ↓
MongoDB Atlas
```

개발 환경에서는 Hot Reload로 인해 MongoDB 연결이 반복 생성되지 않도록 연결 객체를 캐싱하는 구조를 사용합니다.

---

## 17. 권장 개발 순서

### Step 1. 프로젝트 생성

```bash
npx create-next-app@latest devmeet
cd devmeet
```

### Step 2. 패키지 설치

```bash
npm install mongoose bcryptjs jose zod react-hook-form lucide-react
npm install -D @types/bcryptjs
```

### Step 3. MongoDB 연결

- MongoDB Atlas 생성
- Database 생성
- Connection String 발급
- `.env.local` 설정
- `lib/mongodb.ts` 작성

### Step 4. Model 작성

```text
models/User.ts
models/Post.ts
models/Application.ts
```

### Step 5. 회원가입 / 로그인

```text
POST /api/auth/register
POST /api/auth/login
```

### Step 6. 모집글 CRUD

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
```

### Step 7. 참여 신청

```text
POST /api/posts/:id/apply
```

### Step 8. 권한 검증

- 작성자 본인만 수정
- 작성자 본인만 삭제
- 작성자 본인만 모집 완료 처리

### Step 9. UI 연결

```text
화면
 ↓
fetch()
 ↓
Next.js Route Handler
 ↓
Validation
 ↓
Mongoose
 ↓
MongoDB
 ↓
Response
 ↓
UI 업데이트
```

### Step 10. 테스트

- 정상 입력
- 빈 값
- 공백 문자열
- 잘못된 ID
- 로그인하지 않은 요청
- 만료된 JWT
- 타인의 게시글 수정 / 삭제
- 중복 신청
- 모집 완료 게시글 신청

---

## 18. 테스트 체크리스트

### 회원가입 / 로그인

- [ ] 정상 회원가입
- [ ] 중복 이메일
- [ ] 비밀번호 불일치
- [ ] 필수값 누락
- [ ] 정상 로그인
- [ ] 잘못된 비밀번호
- [ ] 존재하지 않는 계정

### 모집글

- [ ] 목록 조회
- [ ] 상세 조회
- [ ] 정상 작성
- [ ] 필수값 누락
- [ ] 제목 / 본문 공백 입력
- [ ] `capacity = 1`
- [ ] `capacity = 0`
- [ ] 음수 입력
- [ ] 정상 수정
- [ ] 작성자가 아닌 사용자의 수정
- [ ] 정상 삭제
- [ ] 작성자가 아닌 사용자의 삭제

### 참여 신청

- [ ] 정상 신청
- [ ] 로그인하지 않은 신청
- [ ] 존재하지 않는 게시글 신청
- [ ] 모집 완료 게시글 신청
- [ ] 동일 게시글 중복 신청
- [ ] 신청 성공 후 버튼 비활성화

---

## 19. 디버깅 순서

문제가 발생했을 때 다음 순서로 확인합니다.

### 모집글이 DB에 저장되지 않는 경우

```text
1. 브라우저 Network 탭
   ↓
2. HTTP Method / URL 확인
   ↓
3. Request Body 확인
   ↓
4. Response Status Code 확인
   ↓
5. Next.js Route Handler 로그 확인
   ↓
6. Mongoose Validation / DB 에러 확인
   ↓
7. MongoDB Atlas / Compass에서 실제 데이터 확인
```

### 참여 신청이 저장되지 않는 경우

```text
1. POST /api/posts/:id/apply 요청 확인
   ↓
2. Status Code 확인
   ↓
3. JWT 인증 결과 확인
   ↓
4. req.params.id 확인
   ↓
5. req.user 확인
   ↓
6. 중복 Application 조회 결과 확인
   ↓
7. Application Collection 확인
```

특히 다음 상태 코드를 먼저 확인합니다.

```text
401 → 인증 문제
400 → 입력값 문제
403 → 권한 문제
404 → 게시글 문제
409 → 중복 신청 문제
500 → 서버 / DB 문제
```

---

## 20. Git 브랜치 권장 규칙

```text
main
└── develop
    ├── feature/auth
    ├── feature/post-crud
    ├── feature/application
    └── feature/ui
```

커밋 예시:

```text
feat: 회원가입 API 구현
feat: 모집글 CRUD 구현
feat: 참여 신청 API 구현
fix: 중복 신청 검증 오류 수정
fix: 게시글 작성 validation 수정
refactor: MongoDB connection 구조 개선
style: 모집글 카드 UI 수정
docs: README 작성
```

---

## 21. MVP 완료 기준

다음 기능이 정상적으로 동작하면 MVP 완료로 판단합니다.

- [ ] 회원가입
- [ ] 로그인
- [ ] 모집글 목록 조회
- [ ] 모집글 상세 조회
- [ ] 모집글 작성
- [ ] 모집글 수정
- [ ] 모집글 삭제
- [ ] 작성자 권한 검증
- [ ] 모집 상태 변경
- [ ] 참여 신청
- [ ] 중복 신청 방지
- [ ] 모집 완료 게시글 신청 차단
- [ ] 주요 에러 상태 코드 처리

---

## 22. 프로젝트 핵심 데이터 흐름

```text
                    ┌─────────────┐
                    │    User     │
                    │ 회원 정보    │
                    └──────┬──────┘
                           │
                           │ 1:N
                           ↓
                    ┌─────────────┐
                    │    Post     │
                    │ 모집글       │
                    └──────┬──────┘
                           │
                           │ 1:N
                           ↓
                    ┌─────────────┐
                    │ Application │
                    │ 참여 신청    │
                    └─────────────┘
                           ↑
                           │
                           │ N:1
                           │
                    ┌──────┴──────┐
                    │    User     │
                    └─────────────┘
```

DevMeet의 핵심 흐름은 다음과 같습니다.

```text
사용자 회원가입
    ↓
로그인
    ↓
모집글 조회
    ↓
모집글 작성
    ↓
다른 사용자가 모집글 확인
    ↓
참여 신청
    ↓
Application 저장
    ↓
중복 신청 방지
    ↓
작성자가 모집 완료 처리
```

---

## 23. 포트폴리오에서 보여줄 핵심

이 프로젝트는 단순한 게시판 구현에 그치지 않고 다음 내용을 보여주는 것을 목표로 합니다.

1. **CRUD**
   - 모집글 생성 / 조회 / 수정 / 삭제

2. **Authentication**
   - 회원가입 / 로그인
   - JWT 기반 사용자 인증

3. **Authorization**
   - 작성자 본인 여부 확인
   - 타인의 게시글 수정 / 삭제 차단

4. **Database Modeling**
   - User / Post / Application 관계 설계
   - Reference 기반 데이터 모델링

5. **Business Logic**
   - 모집 상태 관리
   - 참여 신청
   - 중복 신청 방지

6. **Validation & Error Handling**
   - Client / Server / DB 단계별 Validation
   - HTTP 상태 코드에 따른 오류 처리

7. **Full-stack Data Flow**
   - UI → API → DB → Response → UI 업데이트의 전체 흐름 구현

---

## 24. 참고한 프로젝트 설계 기준

프로젝트 기획 과정에서 정리한 내용을 기준으로 MVP를 구성했습니다.

- 핵심 Collection: `User`, `Post`, `Application`
- `Post.author`는 `User`를 Reference
- `Application`을 통해 사용자와 모집글의 참여 관계 관리
- `techStack`은 MVP에서 문자열 배열로 관리
- 신청자 수를 Post에 별도 저장하지 않고 Application 데이터로 관리
- 작성자 ID는 Request Body에서 받지 않고 인증 정보에서 서버가 추출
- 모집글 수정에는 `PATCH` 사용
- 중복 신청은 `409 Conflict`로 처리

---

## 25. 실행 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd devmeet
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 생성 후 MongoDB URI와 JWT Secret을 입력합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

### 5. 빌드 테스트

```bash
npm run build
```

### 6. 프로덕션 실행

```bash
npm start
```

---

## 26. 프로젝트 목표

> **"스터디와 프로젝트 팀원을 찾는 과정을 더 쉽고 명확하게 만든다."**

DevMeet은 최소한의 기능으로 실제 서비스의 핵심 흐름을 구현하고, 이후 검색·필터링·북마크·댓글 등의 기능을 단계적으로 확장하는 것을 목표로 합니다.
