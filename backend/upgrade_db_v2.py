import pymysql
from app.core.config import settings

def upgrade_db_v2():
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
        
        # 1. Update Users Table
        print("Updating 'users' table with tier and usage columns...")
        alter_users_sql = """
        ALTER TABLE users 
        ADD COLUMN tier ENUM('free', 'vip', 'svip') DEFAULT 'free',
        ADD COLUMN subscription_end DATETIME DEFAULT NULL,
        ADD COLUMN tarot_used_today INT DEFAULT 0,
        ADD COLUMN bazi_used_today INT DEFAULT 0,
        ADD COLUMN last_usage_reset DATE DEFAULT (CURRENT_DATE);
        """
        try:
            cursor.execute(alter_users_sql)
            conn.commit()
            print("Users table updated.")
        except pymysql.err.OperationalError as e:
            if "Duplicate column" in str(e):
                print("Tier columns already exist.")
            else:
                raise e

        # 2. Create Orders Table
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
        conn.commit()
        print("Orders table created.")
        
        # Set root as SVIP for testing
        print("Setting root user as SVIP...")
        cursor.execute("UPDATE users SET tier = 'svip', is_vip = TRUE WHERE username = 'root';")
        conn.commit()
        
        conn.close()
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db_v2()
