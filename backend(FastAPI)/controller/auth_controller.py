import uuid
from fastapi import Request, HTTPException, Response
from fastapi.responses import JSONResponse
from model.user_model import create_user, get_user_by_email



# 회원가입
async def signup_user(request: Request):
    '''
    mysql을 통해서 db구성
    '''
    try:
        body= await request.json()
        email = body.get("email")
        password = body.get("password")
        nickname = body.get("nickname")
    except:
        raise HTTPException(status_code = 400, detail = "Invalid JSON format")
    
    if not email or not password or not nickname:
        raise HTTPException(status_code = 400, detail = "Email, password and nickname required")
    
    try:
        is_created = create_user(email, password, nickname)

        if not is_created:
            raise HTTPException(status_code=409, detail = "Email already exists")
        
        return JSONResponse(
            status_code=201,
            content = {
                "message" : "User created successfully",
                "email" : email
            }
        )
    
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e: #model에서 던진 e
        raise HTTPException(status_code = 500, detail = "Internal Server Error")
    

# 로그인
async def login_user(request: Request):
    '''
    return 은 jsonresponse지만
    main의 sessionmiddleware가 request.session에 들어있는 정보들을 암호화(서명, 인코딩)
    서버는 해당 정보를 http헤더에 실어서 보내줌 + return값
    그걸 브라우저는 가지고있다가 접속할때 요청 헤더에 자동으로 실어서 보냄
    어떻게 그걸 같은 도메인인지 알고? -> 애초에 쿠키를 받을 때 어디서 가져왔나를 자동으로 기록함
    
    '''
    try:
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
    except:
        raise HTTPException(status_code=400, detail = "Invalid JSON format")

    # 필수값 검증
    if not email or not password:
        raise HTTPException(status_code=400, detail="email_or_password_required")
    
    try:
        user_record = get_user_by_email(email)

        if not user_record or user_record["password"] != password:
            raise HTTPException(status_code = 401, detail = "Invalid email or password")
        #login success
        session_id = str(uuid.uuid4())
        request.session["sessionID"] = session_id
        request.session["email"] = email
        request.session["nickname"] = user_record.get("nickname", "Unknown") #nickname 못받으면 Unknown으로
        request.session["user_id"] = user_record.get("id")


        return JSONResponse(
            status_code=200,
            content={"message": "login successful",
                      "session_id": session_id,
                      "email": email,
                      "nickname" : user_record.get("nickname")
                      }
        )
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"DB Error : {e}")
        raise HTTPException(status_code = 500, detail = "Database Error")


# 로그아웃
async def logout_user(request: Request):
    request.session.clear()
    return Response(status_code = 204)

# status 확인
async def get_auth_status(request: Request):
    username = request.session.get("email")
    if not username:
        raise HTTPException(status_code = 401, detail = "unauthorized")
    return {"username": username}

async def get_my_profile(request: Request):
    email = request.session.get("email")
    session_id = request.session.get("sessionID")
    nickname = request.session.get("nickname")
    if not email or not session_id:
        raise HTTPException(status_code = 401, detail = "not_authenticated")
    return JSONResponse(
        status_code = 200,
        content = {
            "message" : f"Welcome, {email}",
            "your_session_id" : session_id,
            "nickname" : nickname
        }
    )