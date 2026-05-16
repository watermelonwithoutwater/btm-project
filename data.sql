-- 1. إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS btm_db;
USE btm_db;

-- 2. إنشاء جدول المستخدمين
-- تم ضبط القيود لضمان عدم تضارب البيانات (Unique Constraints)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- بيانات الهوية (عملية الـ Check تعتمد عليها)
    username VARCHAR(50) NOT NULL UNIQUE, 
    email VARCHAR(100) NOT NULL UNIQUE,
    
    -- بيانات التحقق (تستخدم في الـ Read التقليدي)
    password_hash VARCHAR(255) DEFAULT NULL,
    
    -- بيانات الربط مع جوجل (OAuth 2.0)
    google_id VARCHAR(255) UNIQUE DEFAULT NULL,
    
    -- بيانات إضافية للتوثيق
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- حالة الحساب
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. إنشاء جدول لسجلات الدخول (اختياري لزيادة الأمان)
CREATE TABLE IF NOT EXISTS login_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);