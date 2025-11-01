# 강의실 예약 시스템

React + Vite 기반의 실시간 강의실 예약 시스템 프론트엔드입니다.

## 주요 기능

### 학생 기능
- 회원가입 / 로그인
- 강의실 목록 조회 및 필터링
- 강의실 예약 생성 (날짜, 시간 선택)
- 내 예약 내역 조회
- 예약 취소

### 관리자 기능
- 로그인
- 강의실 CRUD (생성, 조회, 수정, 삭제)
- 강의실 정보 관리

## 기술 스택

- **프레임워크**: React 18
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **라우팅**: React Router DOM
- **상태 관리**: React Context API
- **HTTP 클라이언트**: Axios

## 폴더 구조

```
src/
 ├── components/          # 재사용 가능한 컴포넌트
 │   ├── Layout.jsx      # 레이아웃 및 네비게이션
 │   └── ProtectedRoute.jsx # 인증된 라우트 보호 컴포넌트
 ├── pages/              # 페이지 컴포넌트
 │   ├── Home.jsx        # 홈 페이지
 │   ├── Login.jsx       # 로그인 페이지
 │   ├── Signup.jsx      # 회원가입 페이지
 │   ├── ClassroomList.jsx        # 강의실 목록
 │   ├── Reservation.jsx          # 예약 생성
 │   ├── MyReservations.jsx       # 내 예약 내역
 │   └── AdminClassroomManagement.jsx # 강의실 관리 (관리자)
 ├── context/            # Context API
 │   └── AuthContext.jsx # 인증 컨텍스트
 ├── api/                # API 클라이언트
 │   ├── api.js          # Axios 인스턴스 설정
 │   ├── auth.js         # 인증 관련 API
 │   ├── classroom.js    # 강의실 관련 API
 │   └── reservation.js  # 예약 관련 API
 ├── App.jsx             # 메인 앱 컴포넌트
 ├── main.jsx            # 진입점
 └── index.css           # 글로벌 스타일
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 API 베이스 URL을 설정합니다:

```env
# 백엔드 API URL (백엔드가 있는 경우)
VITE_API_BASE_URL=http://localhost:3000/api

# 개발 모드 활성화 (백엔드 없이 테스트하려면 true로 설정)
VITE_DEV_MODE=true
```

**💡 팁**: `VITE_DEV_MODE=true`로 설정하면 백엔드 서버 없이도 Mock 데이터로 테스트할 수 있습니다!

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## 개발 모드 (Mock Data)

백엔드 서버가 없어도 바로 테스트할 수 있습니다:

1. `.env` 파일에 `VITE_DEV_MODE=true` 추가
2. `npm run dev` 실행
3. 회원가입/로그인부터 모든 기능을 실제처럼 사용 가능
4. 데이터는 브라우저의 localStorage에 저장됩니다

## API 엔드포인트

프로젝트는 다음 REST API 엔드포인트와 통신합니다:

### 인증
- `POST /api/auth/login/student` - 학생 로그인
- `POST /api/auth/login/admin` - 관리자 로그인
- `POST /api/auth/signup/student` - 학생 회원가입
- `POST /api/auth/signup/admin` - 관리자 회원가입

### 강의실
- `GET /api/classrooms` - 강의실 목록 조회
- `GET /api/classrooms/:id` - 강의실 상세 조회
- `POST /api/classrooms` - 강의실 생성 (관리자)
- `PUT /api/classrooms/:id` - 강의실 수정 (관리자)
- `DELETE /api/classrooms/:id` - 강의실 삭제 (관리자)

### 예약
- `GET /api/reservations` - 예약 목록 조회
- `GET /api/reservations/my` - 내 예약 목록
- `GET /api/reservations/:id` - 예약 상세 조회
- `POST /api/reservations` - 예약 생성
- `PUT /api/reservations/:id` - 예약 수정
- `DELETE /api/reservations/:id` - 예약 취소
- `GET /api/reservations/available/:classroomId` - 예약 가능 시간 조회

## 인증

프로젝트는 JWT 기반 인증을 사용합니다. 로그인 성공 시 토큰이 저장되며, 이후 모든 API 요청에 자동으로 포함됩니다.

## 역할 기반 접근 제어

- **학생**: 강의실 조회, 예약 생성/조회/취소 가능
- **관리자**: 모든 학생 기능 + 강의실 관리 (CRUD) 가능

## 라우팅

- `/` - 홈 페이지
- `/login` - 로그인
- `/signup` - 회원가입
- `/classrooms` - 강의실 목록 (인증 필요)
- `/reserve` - 예약 생성 (인증 필요)
- `/my-reservations` - 내 예약 내역 (인증 필요)
- `/admin/classrooms` - 강의실 관리 (관리자만 접근 가능)

