from mysql.connector import Error
from database.connection import get_db_connection

def create_post(user_id, title, content):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = "INSERT INTO posts (user_id, title, content) VALUES (%s, %s, %s)"
        cursor.execute(sql, (user_id, title, content))
        conn.commit()
        return True
    except Error as e:
        print(f"Post Create Error: {e}")
        return False
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def get_all_posts():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True)

        sql = """
            SELECT
                p.post_id,
                p.title,
                p.content,
                p.created_at,
                u.nickname as author_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            """
        cursor.execute(sql)
        posts = cursor.fetchall()
        return posts
    except Error as e:
        print(f"Post Get Error: {e}")
        return []
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

