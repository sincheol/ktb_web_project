from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from model.post_model import create_post, get_all_posts

async def write_post(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code = 401, detail = "Login Required")
    
    try:
        body = await request.json()
        title = body.get("title")
        content = body.get("content")
    except:
        raise HTTPException(status_code = 400, detail = "Invalid JSON")
    
    if not title or not content:
        raise HTTPException(status_code = 400, detail = "Title and content required")
    
    success = create_post(user_id, title, content)

    if not success:
        raise HTTPException(status_code = 500, detail = "Failed to create post")
    
    return JSONResponse(
        status_code=201,
        content = {
            "message" : "Post created Successfully"
        }
    )

async def read_posts(request: Request):
    # login user만 조회가능
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code = 401, detail = "Login Required")
    posts = get_all_posts()
    json_compatible_posts = jsonable_encoder(posts)

    return JSONResponse(
        status_code = 200,
        content = {
            "posts" : json_compatible_posts
        }
    )