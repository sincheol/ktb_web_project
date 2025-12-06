import mysql.connector
from mysql.connector import Error
from database.connection import get_db_connection


def create_user(email, password, nickname):
    #초기화
    conn = None
    cursor = None

    try:
        # DB연결
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insertion
        sql = "INSERT INTO users (email, password, nickname) VALUES (%s, %s, %s)"
        cursor.execute(sql, (email, password, nickname))

        #commit
        conn.commit()
        return True #성공
    
    except mysql.connector.IntegrityError:
        # email 중복
        return False
    
    except Error as e:
        print(f"DB Erorr : {e}")
        raise e # controller에게 줌
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def get_user_by_email(email):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary = True) # dict로 가져올거임

        # SELECT
        sql = "SELECT * FROM users WHERE email = %s"
        cursor.execute(sql, (email,)) # -> tuple / ,가 없으면 str으로 
        user_record = cursor.fetchone() #email은 unique라 하나밖에 없음

        return user_record # 없으면 return None

    except Error as e:
        print(f"DB Error : {e}")
        raise Error
    finally:
        if cursor: cursor.close()
        if conn: conn.close()