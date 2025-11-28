# AICC MMP - AI 콜센터 관리 플랫폼

AI 콜센터를 위한 종합 모니터링 및 관리 대시보드입니다.

## 프로젝트 구조

```
aiccmvp/
├── index.html                      # AI 모니터링 페이지 (메인)
├── consultation-history.html       # AI 상담이력 페이지
├── keywords.html                   # 키워드 분석 페이지
├── styles/
│   ├── main.scss                   # SCSS 소스 파일
│   └── main.css                    # 컴파일된 CSS 파일
├── scripts/
│   ├── app.js                      # AI 모니터링 로직
│   ├── consultation-history.js     # 상담이력 로직
│   └── keywords.js                 # 키워드 분석 로직
└── README.md                       # 프로젝트 문서
```

## 주요 기능

### 🤖 AI 모니터링 (index.html)
**실시간 통계 카드**
- 세션 수, 평균 응답 시간, 인텐트 인식 성공률
- 상담 성공률, 상담사 연결 건수

**세션 타임라인**
- 48개 세션 실시간 모니터링
- 단계별 진행률 시각화 (인사말, 용건 수집, 김정 구간)
- 세션별 상세 정보 및 전환 기능

**상세 지표**
- 통계 요약 (STT/처리/TTS 시간, 이상 상태)
- 대화 품질 (평균 문장 수, 발언 패턴)
- 버그 감지/평가

### 📋 AI 상담이력 (consultation-history.html)
**필터링 기능**
- 기간별 필터 (오늘/7일/30일/직접선택)
- 상담 결과별 필터 (전체/성공/상담사연결/실패)
- 검색 기능 (세션 ID, 고객명)

**상담 이력 테이블**
- 세션 ID, 시작/종료 시간, 소요 시간
- 유입 경로, 상담 유형, 상담 결과
- 고객 만족도 (별점)
- 페이지네이션 (10건/페이지)

**통계 요약**
- 전체 상담 건수, 성공/실패/연결 건수
- 평균 상담 시간

### 🔑 키워드 분석 (keywords.html)
**키워드 통계**
- 등록된 키워드 수, 총 감지 횟수
- 활성 키워드 수, 평균 감지율

**키워드 시각화**
- TOP 10 키워드 순위
- 키워드 클라우드 (빈도 기반 크기)

**키워드 관리**
- 전체 키워드 목록 테이블
- 카테고리별 필터 (제품/불만/일반)
- 트렌드 표시 (상승/하락/유지)
- 키워드 수정/삭제 기능

### 🎨 공통 기능
- 카운트업 애니메이션
- 호버 효과 및 트랜지션
- 완전 반응형 레이아웃
- 일관된 네비게이션

## 실행 방법

### 1. 직접 HTML 열기
```bash
# 브라우저에서 index.html 파일 열기
index.html 더블클릭
```

### 2. 로컬 서버 실행 (권장)

#### Python 사용
```bash
# Python 3
python -m http.server 8000

# 브라우저에서 접속
http://localhost:8000
```

#### Node.js 사용
```bash
# http-server 설치
npm install -g http-server

# 서버 실행
http-server -p 8000

# 브라우저에서 접속
http://localhost:8000
```

#### VS Code Live Server 사용
1. VS Code에서 Live Server 확장 설치
2. index.html 우클릭
3. "Open with Live Server" 선택

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **SCSS/CSS3**: 반응형 스타일링
- **Vanilla JavaScript**: 인터랙티브 기능

## 반응형 브레이크포인트

- **Desktop** (1440px+): 5열 통계 카드, 5-6열 세션 그리드
- **Tablet** (768px - 1439px): 3열 통계 카드, 3-4열 세션 그리드
- **Mobile** (< 768px): 1열 통계 카드, 1-2열 세션 그리드

## 색상 시스템

| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| Primary | `#00D9C0` | 메인 액센트 (민트) |
| Primary Dark | `#00B8A9` | 사이드바 배경 |
| Warning | `#FF6B35` | 경고 및 알림 |
| Success | `#4A90E2` | 긍정 지표 |
| Error | `#E74C3C` | 에러 및 부정 지표 |

## 페이지별 주요 기능

### AI 모니터링 (index.html)
```javascript
// 전역 객체를 통한 제어
dashboardApp.filterSessions('pending');
dashboardApp.sortSessions('time');
dashboardApp.handleRefresh();
```

### AI 상담이력 (consultation-history.html)
- 자동 필터링 및 페이지네이션
- 실시간 검색
- CSV 내보내기 (예정)

### 키워드 분석 (keywords.html)
- 동적 키워드 클라우드
- TOP 10 키워드 순위
- 카테고리별 필터링
- 키워드 추가/수정/삭제

## 커스터마이징

### 색상 변경
[styles/main.scss](styles/main.scss) 파일 상단의 변수를 수정:

```scss
$primary: #00D9C0;        // 메인 색상
$primary-dark: #00B8A9;   // 어두운 메인 색상
$warning: #FF6B35;        // 경고 색상
```

변경 후 SCSS를 CSS로 컴파일:
```bash
# sass 설치 (없는 경우)
npm install -g sass

# 컴파일
sass styles/main.scss styles/main.css
```

### 세션 데이터 변경
[scripts/app.js](scripts/app.js)의 `generateSessionData` 함수 수정:

```javascript
const generateSessionData = (count = 48) => {
    // count 값으로 세션 개수 조정
}
```

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 개발자

AI 모니터링 대시보드 v1.0
