# 운행전 자가점검시스템 (Sejin Pre-Trip Mobile Web)

부산 시내버스 업체 '세진여객'의 운전기사 운행전 자가점검시스템입니다.

## 📋 프로젝트 개요

- **목적**: 운전기사가 출근 직후 QR을 스캔하여 근무지·버스번호·면허판번호 입력 및 복장 사진 업로드
- **완료 시간**: 3분 내
- **대상 사용자**: 평균 50~60대 기사
- **UI 방식**: 한 화면 = 한 입력 (Wizard UI)

## 🚀 주요 기능

### ✅ 구현 완료
- [x] **Wizard UI**: 순차형 입력 인터페이스
- [x] **입력 검증**: 실시간 유효성 검사
- [x] **이미지 프리뷰**: 사진 업로드 시 미리보기
- [x] **반응형 디자인**: 모바일 최적화
- [x] **PWA 지원**: 앱 설치 및 오프라인 캐시
- [x] **접근성**: 큰 글자와 버튼, 키보드 지원

### 🔄 진행 예정
- [ ] **토큰 인증**: JWT 기반 로그인 시스템
- [ ] **Apps Script 백엔드**: Google Sheet/Drive 연동
- [ ] **오프라인 동기화**: IndexedDB + 백그라운드 동기화
- [ ] **Looker Studio 대시보드**: 실시간 데이터 시각화

## 📁 파일 구조

```
MDCS/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── main.js             # JavaScript 로직
├── manifest.json       # PWA 매니페스트
├── sw.js              # Service Worker
├── offline.html        # 오프라인 페이지
├── logo.png           # 세진여객 로고 (필요)
├── icons/             # PWA 아이콘들 (필요)
└── README.md          # 프로젝트 문서
```

## 🛠️ 설치 및 실행

### 1. 로컬 개발 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

### 2. 브라우저에서 접속
```
http://localhost:8000
```

## 📱 PWA 설치

### Android Chrome
1. 브라우저에서 사이트 접속
2. 주소창 옆 "설치" 버튼 클릭
3. 홈 화면에 앱 아이콘 생성

### iOS Safari
1. Safari에서 사이트 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 앱 아이콘 생성

## 🔧 개발 가이드

### 입력 검증 규칙
- **근무지**: 2-20글자
- **버스번호**: `부산70-1234` 형식
- **면허판번호**: `70가1234` 형식
- **사진**: 10MB 이하 이미지 파일

### API 엔드포인트 (예정)
```javascript
// 제출 API
POST /api/submit
Content-Type: multipart/form-data

{
  site: "연산차고지",
  busNo: "부산70-1234", 
  plate: "70가1234",
  photo: File,
  timestamp: "2024-01-01T09:00:00Z"
}
```

### 환경 변수 (예정)
```bash
# .env
API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
JWT_SECRET=your-secret-key
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#2563eb` (파란색)
- **Accent**: `#059669` (초록색)
- **Text**: `#1f2937` (진한 회색)
- **Background**: `#f9fafb` (연한 회색)

### 타이포그래피
- **폰트**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR'`
- **제목**: `1.5rem` (24px)
- **본문**: `1.1rem` (18px)
- **버튼**: `1.2rem` (19px)

## 🔒 보안 고려사항

### 현재 상태
- 프론트엔드 전용 프로토타입
- 클라이언트 사이드 검증만 구현

### 향후 개선사항
- [ ] HTTPS 강제 적용
- [ ] JWT 토큰 인증
- [ ] API 요청 제한 (Rate Limiting)
- [ ] 입력값 서버 사이드 검증
- [ ] 파일 업로드 보안 검증

## 📊 성능 최적화

### 현재 구현
- [x] Service Worker 캐싱
- [x] 이미지 압축 및 최적화
- [x] CSS/JS 압축 (빌드 시)
- [x] 지연 로딩 (Lazy Loading)

### 향후 개선사항
- [ ] WebP 이미지 포맷 지원
- [ ] Critical CSS 인라인화
- [ ] 번들 크기 최적화
- [ ] CDN 활용

## 🐛 문제 해결

### 일반적인 문제들

**Q: PWA가 설치되지 않아요**
A: HTTPS 환경에서만 PWA 설치가 가능합니다. 로컬 개발 시 `localhost`는 예외적으로 허용됩니다.

**Q: 사진이 업로드되지 않아요**
A: 파일 크기가 10MB 이하인지, 이미지 파일인지 확인해주세요.

**Q: 오프라인에서 작동하지 않아요**
A: Service Worker가 제대로 등록되었는지 브라우저 개발자 도구에서 확인해주세요.

## 📞 지원

### 개발팀
- **프로젝트 관리**: 세진여객 IT팀
- **기술 문의**: 개발자 이메일

### 버그 리포트
GitHub Issues 또는 이메일로 문의해주세요.

---

**버전**: v1.0.0  
**최종 업데이트**: 2024년 1월  
**라이선스**: 세진여객 내부 사용 