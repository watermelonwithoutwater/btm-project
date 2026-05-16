import mysql.connector

class DBManager:
    def __init__(self):
        self.config = {
            "host": "localhost",
            "user": "root",
            "password": "your_password", # استبدلها بكلمة مرورك
            "database": "btm_db"
        }

    def get_connection(self):
        return mysql.connector.connect(**self.config)

    def check_or_create_user(self, google_id, email, username):
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            # عملية الـ Read & Check: هل المستخدم موجود؟
            query = "SELECT * FROM users WHERE google_id = %s OR email = %s"
            cursor.execute(query, (google_id, email))
            user = cursor.fetchone()

            if not user:
                # عملية الـ Write: إنشاء حساب جديد إذا لم يتضارب مع بيانات سابقة
                insert_query = "INSERT INTO users (username, email, google_id) VALUES (%s, %s, %s)"
                cursor.execute(insert_query, (username, email, google_id))
                conn.commit()
                return {"status": "created", "user": username}
            
            return {"status": "exists", "user": user['username']}
        
        finally:
            cursor.close()
            conn.close()