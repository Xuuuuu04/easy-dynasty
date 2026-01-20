import pymysql
from app.core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def upgrade_db_admin():
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
        
        # 1. Add is_superuser to users
        print("Adding 'is_superuser' column to users...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_superuser BOOLEAN DEFAULT FALSE;")
            conn.commit()
            print("Column added.")
        except pymysql.err.OperationalError as e:
            if "Duplicate column" in str(e):
                print("Column 'is_superuser' already exists.")
            else:
                raise e

        # 2. Create SystemSettings Table
        print("Creating 'system_settings' table...")
        create_settings_sql = """
        CREATE TABLE IF NOT EXISTS system_settings (
            `key` VARCHAR(50) PRIMARY KEY,
            `value` TEXT NOT NULL,
            `description` VARCHAR(255)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        cursor.execute(create_settings_sql)
        conn.commit()
        print("SystemSettings table created.")

        # 3. Create or Update 'admin' user
        admin_user = 'admin'
        admin_pass = 'xsy19507'
        
        cursor.execute("SELECT id FROM users WHERE username = %s", (admin_user,))
        result = cursor.fetchone()
        
        hashed_pw = get_password_hash(admin_pass)
        
        if result:
            print(f"Updating existing admin user '{admin_user}'...")
            cursor.execute("""
                UPDATE users 
                SET is_superuser = TRUE, hashed_password = %s, tier = 'svip' 
                WHERE username = %s
            """, (hashed_pw, admin_user))
        else:
            print(f"Creating new admin user '{admin_user}'...")
            cursor.execute("""
                INSERT INTO users (username, hashed_password, tier, is_superuser) 
                VALUES (%s, %s, 'svip', TRUE)
            """, (admin_user, hashed_pw))
        conn.commit()
        print("Admin user ready.")

        # 4. Initialize Default Settings
        print("Initializing default system settings...")
        default_settings = [
            ('LLM_MODEL', 'moonshotai/Kimi-K2-Instruct-0905', '当前使用的 LLM 模型名称'),
            ('DEFAULT_LLM_API_KEY', 'sk-your-key-here', '系统默认 API Key (后端使用)'),
            ('SYSTEM_NOTICE', '欢迎来到易朝启示录', '系统公告 (显示在首页)'),
        ]
        
        for key, val, desc in default_settings:
            cursor.execute("""
                INSERT INTO system_settings (`key`, `value`, `description`) 
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE `description` = %s
            """, (key, val, desc, desc))
        conn.commit()
        
        conn.close()
        print("Admin upgrade complete.")
        
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db_admin()
