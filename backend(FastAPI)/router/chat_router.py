from fastapi import APIRouter, Request
from controller.chat_controller import chat_with_rag

router = APIRouter(prefix = '/chat', tags = ['chat'])

@router.post('/rag')
async def chat(request : Request):
    """
    ???post는 생성아니야? - 우리는 chat을 통해 답변을 받아오는거니깐 get아닌가
    -> 우선 get에는 보내는 데이터의 크기에 한계가 존재.. -> post는 용량 제한이 사실상 없음
    또한 post는 암호화되어 보내지지만 get은 질문내용이 남음
    최종적으로 답변은 llm 모델이 새로운 데이터를 생성하는 것임
    => post를 사용
    """
    return await chat_with_rag(request)