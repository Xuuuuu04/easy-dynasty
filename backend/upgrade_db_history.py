import pymysql
from app.core.config import settings

def upgrade_db_history():
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
        
        print("Creating 'history_records' table...")
        create_history_sql = """
        CREATE TABLE IF NOT EXISTS history_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('tarot', 'bazi') NOT NULL,
            title VARCHAR(255) NOT NULL,
            data JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_type (user_id, type),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        cursor.execute(create_history_sql)
        conn.commit()
        
        print("History DB upgrade complete.")
        conn.close()
        
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db_history()
