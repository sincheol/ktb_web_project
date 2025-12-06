from fastapi import APIRouter, Request
from controller.auth_controller import login_user, logout_user, signup_user, get_auth_status, get_my_profile

router = APIRouter(prefix="/auth", tags=["auth"]) #prefix 때문에 router에 연결되는 모든 주소는 자동적으로 /auth가 붙음

@router.post("/signup")
async def signup(request: Request):
    return await signup_user(request)

@router.post("/login")
async def login(request: Request):
    return await login_user(request)

@router.delete("/logout")
async def logout(request: Request):
    return await logout_user(request)

@router.get("/status")
async def status(request: Request):
    return await get_auth_status(request)

@router.get("/profile")
async def profile(request: Request):
    return await get_my_profile(request)