import pymysql
from app.core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_db():
    print(f"Connecting to MySQL at {settings.DB_HOST}...")
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=int(settings.DB_PORT)
        )
        cursor = conn.cursor()
        
        print(f"Checking if database '{settings.DB_NAME}' exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.execute(f"USE {settings.DB_NAME};")
        
        print("Creating table 'users'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                hashed_password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Create default root user if not exists
        check_user_sql = "SELECT * FROM users WHERE username = %s"
        cursor.execute(check_user_sql, ('root',))
        if not cursor.fetchone():
            print("Creating default root user...")
            hashed_pw = get_password_hash('xsy19507')
            insert_user_sql = "INSERT INTO users (username, hashed_password) VALUES (%s, %s)"
            cursor.execute(insert_user_sql, ('root', hashed_pw))
            conn.commit()
            print("Default user 'root' created.")
        else:
            print("User 'root' already exists.")

        print(f"Database initialized successfully.")
        
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
