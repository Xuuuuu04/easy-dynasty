import pymysql
from app.core.config import settings

def upgrade_db_v3():
    print(f"Connecting to MySQL at {settings.DB_HOST}...")
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=int(settings.DB_PORT),
            database=settings.DB_NAME
        )
        cursor = conn.cursor()
        
        # 1. Create User Profiles Table
        print("Creating 'user_profiles' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(50) NOT NULL,
            gender ENUM('male', 'female') NOT NULL,
            relation VARCHAR(20) DEFAULT '亲友',
            birth_year INT NOT NULL,
            birth_month INT NOT NULL,
            birth_day INT NOT NULL,
            birth_hour INT NOT NULL,
            birth_minute INT NOT NULL,
            birth_place VARCHAR(100),
            is_true_solar_time BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 2. Create Feedback/Notification Table
        print("Creating 'user_feedbacks' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_feedbacks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('tarot', 'bazi') NOT NULL,
            related_history_id INT, 
            score INT DEFAULT 0, -- 1 for like, -1 for dislike, or 1-5 stars
            content TEXT,
            admin_reply TEXT,
            replied_at TIMESTAMP NULL,
            is_read_by_user BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        conn.commit()
        print("V3 Upgrade (Profiles & Feedback) complete.")
        conn.close()
        
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db_v3()
