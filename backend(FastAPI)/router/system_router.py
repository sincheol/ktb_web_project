from fastapi import APIRouter
from controller.system_controller import get_server_message

router = APIRouter(tags = ["System"]) #prefix = "/"

@router.get("/")
async def read_root():
    return await get_server_message()