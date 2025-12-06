from mysql.connector import Error
from database.connection import get_db_connection

def get_posts_context(keyword = None, limit = 5):
    '''
    keyword가 있으면 해당 단어가 포함된 글을 검색하고,
    없으면 최신 글을 가져옴.
    '''
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        if keyword:
            # title이나 content에 키워드가 포함된 글을 찾음
            # !%키워드%를 통해 앞뒤에 다른 글자가 있어도 찾게 함!
            search_term = f"%{keyword}%"
            sql = f"""
                SELECT p.title, p.content, u.nickname
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.title LIKE %s OR p.content LIKE %s
                ORDER BY p.created_at DESC
                LIMIT {int(limit)}
                """
            cursor.execute(sql, (search_term, search_term)) # %s 두개에 search_term넘겨줌
        else:
            # 키워드가 없으면 최신글 5개 중에서 가져옴
            sql = f"""
                SELECT p.title, p.content, u.nickname
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
                LIMIT {int(limit)}
                """
            cursor.execute(sql)

        posts = cursor.fetchall()

        # 검색 결과가 없을 때 처리
        if not posts:
            if keyword:
                return f"'{keyword}'에 대한 관련 게시글을 찾을 수 없습니다."
            else:
                return "게시글이 없습니다." # 글이 없는 상황

        context_text = ""

        for post in posts:
            context_text += f" 작성자 : {post['nickname']}\n"
            context_text += f" 제목 : {post['title']}\n"
            context_text += f" 내용 : {post['content']}\n"
            context_text += "===========\n"

        return context_text

    except Error as e:
        print(f"RAG context error {e}")
        return ""
    finally:
        if cursor: cursor.close()
        if conn: conn.close()