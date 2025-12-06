🚀 AI-Powered Community Backend Project (FastAPI + Ollama)

이 프로젝트는 FastAPI 백엔드 시스템 구축을 시작으로, MySQL 데이터베이스 연동, 그리고 **Local LLM (Gemma 3)**을 활용한 RAG(검색 증강 생성) 서비스까지 확장을 준비중인 프로젝트입니다.

🏗️ 아키텍처 및 폴더 구조

Router-Controller-Model의 계층형 아키텍처를 준수했습니다.

📦 Project Root

├── main.py                  # [현관문] 서버 실행, 미들웨어(세션, CORS) 설정, 라우터 등록

├── router/                  # [안내 데스크] URL 요청을 받아 적절한 컨트롤러로 연결

│   ├── auth_router.py       # 로그인, 회원가입, 로그아웃

│   ├── post_router.py       # 게시글 작성, 조회

│   ├── chat_router.py       # AI 채팅 (RAG)

│   └── system_router.py     # 서버 상태 확인 (Health check)

├── controller/              # [실무 담당자] 데이터 검증, 비즈니스 로직 판단, 예외 처리

│   ├── auth_controller.py

│   ├── post_controller.py

│   ├── system_controller.py

│   └── chat_controller.py   # RAG 로직 및 스트리밍 응답 제어

├── model/                   # [창고 관리자] 데이터베이스 쿼리(SQL) 실행 전담

│   ├── user_model.py

│   ├── post_model.py           

│   └── chat_model.py        # AI가 읽기 좋게 게시글 데이터를 텍스트로 가공

└── database

    └── connection.py # DB 접속 정보 관리

✨ 핵심 구현 기능

1. 사용자 인증 (Authentication)

세션 기반 로그인: SessionMiddleware를 사용하여 서버 메모리나 DB가 아닌, 브라우저 쿠키에 암호화된 세션 정보를 저장하는 방식을 사용.

회원가입/로그인: MySQL users 테이블과 연동하여 중복 가입 방지 로직을 구현.

2. 커뮤니티 게시판 (Board)

게시글 작성/조회: 로그인한 사용자만 글을 쓸 수 있도록 권한을 제어.

3. AI 챗봇 & RAG (Retrieval-Augmented Generation)

맥락을 이해하는 AI: 사용자가 질문하면 chat_model이 DB에서 최신 게시글 5개를 조회.

프롬프트 엔지니어링: 조회한 게시글을 "문맥(Context)"으로 프롬프트에 주입하여, Ollama(Gemma 3)가 커뮤니티의 내용을 꿰뚫고 있음.

스트리밍 응답: StreamingResponse를 적용.

🚀 설치 및 실행 가이드

1. 사전 준비 (Prerequisites)

Ollama가 설치되어 있고 gemma3:4b 모델이 다운로드되어 있어야 합니다.

2. 데이터베이스 설정

DBeaver 등의 툴을 이용해 아래 SQL로 테이블을 생성해주세요.

CREATE DATABASE user_info;
USE user_info;

-- 사용자 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL
);

-- 게시글 테이블
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


3. 서버 실행

# 필요한 라이브러리 설치
pip install fastapi uvicorn mysql-connector-python ollama streamlit

# FastAPI 서버 실행
uvicorn main:app --reload


Swagger UI 접속: http://127.0.0.1:8000/docs 에서 모든 API를 테스트할 수 있습니다.


🎯 최종 목표 및 향후 계획 (Future Roadmap)

아직은 게시글을 가져와서 어떤 내용이 있는지에 대해서만 얘기하는 Context Stuffing 단계에 있음.

그마저도 최신글 5개를 기반으로만 함.

향후 query문을 업데이트해서 사용자의 질문에 대한 게시글만 가져와 내용을 더 보강해서 대답하게 만들 예정..

모델이 가벼워서 질문의 질에 따라 게시글을 잘 가져와 내용까지 보완할 때도 있지만 해당 키워드에 대한 게시글도 못가져올 때도 있음

[질문에 대한 답변](backend)

![alt text](image.png)

!Front End 추가!

괜찮은 답변을 하는 케이스 :
![alt text](image-1.png)

![alt text](image-2.png)

글을 읽었지만 못찾는다는 답변을 하는 이상한 케이스..:
![alt text](image-3.png)