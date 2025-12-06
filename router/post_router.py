from fastapi import APIRouter, Request
from controller.post_controller import write_post, read_posts

router = APIRouter(prefix = "/posts", tags = ["posts"])

@router.post("/")
async def create(request: Request):
    return await write_post(request)

@router.get("/")
async def read(request: Request):
    return await read_posts(request)