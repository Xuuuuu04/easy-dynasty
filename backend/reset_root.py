import pymysql
from app.core.config import settings
from passlib.context import CryptContext

# Setup Auth Context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_root():
    print(f"Connecting to MySQL at {settings.DB_HOST}...")
    conn = pymysql.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        port=int(settings.DB_PORT),
        database=settings.DB_NAME
    )
    cursor = conn.cursor()
    
    username = "root"
    password = "xsy19507"
    
    # 1. Generate new hash
    hashed_pw = pwd_context.hash(password)
    print(f"Generated new hash for '{password}': {hashed_pw[:10]}...")
    
    # 2. Check verify locally
    if pwd_context.verify(password, hashed_pw):
        print("Local verification successful.")
    else:
        print("CRITICAL: Local verification failed!")
        return

    # 3. Update DB
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            print("Updating existing root user...")
            cursor.execute(
                "UPDATE users SET hashed_password = %s WHERE username = %s", 
                (hashed_pw, username)
            )
        else:
            print("Creating new root user...")
            cursor.execute(
                "INSERT INTO users (username, hashed_password, is_vip) VALUES (%s, %s, TRUE)", 
                (username, hashed_pw)
            )
            
        conn.commit()
        print("Root password reset successfully.")
        
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_root()
