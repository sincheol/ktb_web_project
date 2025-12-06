import mysql.connector

DB_config = {
    "host" : "localhost",
    "user" : "root",
    "password" : "1234",
    "database" : "user_info",
    "port" : 3306
}


def get_db_connection():
    return mysql.connector.connect(**DB_config)