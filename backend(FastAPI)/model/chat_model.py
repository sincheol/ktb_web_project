from mysql.connector import Error
from database.connection import get_db_connection

def get_posts_context(limit = 5):
    '''
    최신 글 최대 5개
    '''
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        sql = f"""
            SELECT p.title, p.content, u.nickname
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT {int(limit)}
            """
        cursor.execute(sql)
        posts = cursor.fetchall()

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