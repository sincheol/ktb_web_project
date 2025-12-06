from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from model.chat_model import get_posts_context
import ollama

# async Ollama client 생성
# localhost지만 docker라면 host.docker.internal
client = ollama.AsyncClient()

async def chat_with_rag(request: Request):
    try:
        body = await request.json()
        user_question = body.get("message")
        model_id = body.get("model", "gemma3:4b") # 키가 없으면 기본값인 gemma3를 쓴다
    except:
        return {"error": "Invalid JSON"}
    
    # Retrieval : DB에서 최신 게시글 문맥 가져오기
    community_context = get_posts_context(keyword = user_question, limit = 5)

    # Augmented : prompt보강
    system_prompt = f"""
    You are an AI chatbot that fully understands the contents of community posts.
    Please answer the user's question by referring to the [Search Results] below.
    If the content is not in the posts, answer as an AI expert with general knowledge.
    You have to answer in Korean.

    [최신 글]
    {community_context}
    """

    # system(prompt), user(question) 묶기
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_question}
    ]

    # Generation
    async def response_generator():
        # Ollama에게 비동기로 요청
        # live타자기처럼 나옴
        async for part in await client.chat(model = model_id, messages = messages, stream = True):
            content = part['message']['content']
            if content:
                # 단순 텍스트 스트리밍 방식 사용
                yield content


    return StreamingResponse(response_generator(), media_type = 'text/plain')