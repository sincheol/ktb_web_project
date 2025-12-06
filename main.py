from router.auth_router import router as auth_router
from router.system_router import router as system_router
from router.post_router import router as post_router
from router.chat_router import router as chat_router

'''
각 파일에서는 router로 부르고 있으니 auth_, system_을 붙여줌
'''

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

'''
main->router->controller
'''

app = FastAPI()

#이 사이트로 들어오고 나가는 모든 요청과 응답은 여기를 통과
#max_age는 변경사항이 있을때만 실행됨
#해독은 항상
app.add_middleware(
    SessionMiddleware, #브라우저 요청에 session있나?
    secret_key="yourSecretKey", #secret key를 이용해서 해독
    max_age=24 * 60 * 60, #를 처음보내고 브라우저는 이걸 받아서 계산하고 만료시각을 저장소에 같이 기록함
    same_site="lax", #CSRF 공격 예방 (기본값)
    https_only=False,
    #path = "/"로 기본값
)

app.include_router(system_router)
app.include_router(auth_router)
app.include_router(post_router)
app.include_router(chat_router)