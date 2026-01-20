import pymysql
from app.core.config import settings

def upgrade_db_enterprise():
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
        
        # 1. API Logs Table
        print("Creating 'api_logs' table...")
        create_logs_sql = """
        CREATE TABLE IF NOT EXISTS api_logs (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            endpoint VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            status_code INT NOT NULL,
            process_time_ms FLOAT NOT NULL,
            tokens_used INT DEFAULT 0,
            ip_address VARCHAR(45),
            error_detail TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_timestamp (timestamp),
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        cursor.execute(create_logs_sql)
        
        # 2. Ensure Orders Table Exists (already in v2, but checking safety)
        print("Checking 'orders' table...")
        # Check if table exists
        cursor.execute("SHOW TABLES LIKE 'orders'")
        if not cursor.fetchone():
            print("Creating 'orders' table...")
            create_orders_sql = """
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                out_trade_no VARCHAR(64) NOT NULL UNIQUE,
                trade_no VARCHAR(64) DEFAULT NULL,
                name VARCHAR(100) NOT NULL,
                money DECIMAL(10, 2) NOT NULL,
                type VARCHAR(20) NOT NULL,
                status INT DEFAULT 0,
                tier_requested ENUM('vip', 'svip') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            cursor.execute(create_orders_sql)
        else:
            print("'orders' table exists.")

        conn.commit()
        conn.close()
        print("Enterprise upgrade complete.")
        
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db_enterprise()
