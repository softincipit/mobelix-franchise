# MOBELIX 가맹점 모집 사이트

MOBELIX 4륜 전기자전거 렌탈 가맹점 모집용 원페이지 사이트입니다. 빌드 과정 없는 정적 HTML이며 Netlify에 그대로 배포됩니다.

- `index.html`: 페이지 전체
- `img/`: 제품 사진과 로고 (webp)
- 노란색(`.ph`)으로 표시된 부분은 아직 정해지지 않은 내용입니다.
- 상담 신청 폼은 아직 접수처와 연결되어 있지 않습니다.

## 관리자 화면 (/admin)

상담 신청(Netlify Forms `franchise-inquiry`)을 로그인 후 확인·검색·CSV 저장·삭제합니다.
Netlify > Project configuration > Environment variables에 아래 값을 넣고 다시 배포하세요.

- `ADMIN_EMAIL`: 관리자 로그인 이메일
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `SESSION_SECRET`: 아무 긴 임의 문자열 (로그인 쿠키 서명용)
- `NETLIFY_API_TOKEN`: Netlify User settings > Applications > Personal access tokens에서 만든 토큰
