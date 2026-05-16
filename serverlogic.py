from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2  # 👈 المكتبة البديلة لـ PostgreSQL
from psycopg2.extras import RealDictCursor
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlconnector import DBManager # استيراد ملف الربط

app = Flask(__name__)
CORS(app)
db = DBManager()

GOOGLE_CLIENT_ID = "922073879513-h45gm9u4kk44o3tjgrg96d0jf95puedh.apps.googleusercontent.com"

@app.route('/google-auth', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    
    try:
        # عملية الـ Check: التحقق من توكن جوجل
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', "User_" + google_id[:5])

        # تنفيذ منطق قاعدة البيانات عبر الملف الآخر
        result = db.check_or_create_user(google_id, email, name)

        if result['status'] == "created":
            return jsonify({"message": f"أهلاً بك {name}، تم إنشاء حسابك بنجاح", "success": True})
        else:
            return jsonify({"message": f"مرحباً بعودتك {result['user']}", "success": True})

    except ValueError:
        return jsonify({"error": "فشل التحقق من الهوية، التوكن غير صالح"}), 400
    except Exception as e:
        return jsonify({"error": f"حدث خطأ في الخادم: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)