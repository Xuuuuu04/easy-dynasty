import pymysql
from app.core.config import settings

def upgrade_db():
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
        
        print("Adding 'is_vip' column to 'users' table...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;")
            conn.commit()
            print("Column added successfully.")
        except pymysql.err.OperationalError as e:
            if "Duplicate column" in str(e):
                print("Column 'is_vip' already exists.")
            else:
                raise e
        
        # Set root as VIP for testing
        print("Setting root user as VIP...")
        cursor.execute("UPDATE users SET is_vip = TRUE WHERE username = 'root';")
        conn.commit()
        
        conn.close()
    except Exception as e:
        print(f"Error upgrading database: {e}")

if __name__ == "__main__":
    upgrade_db()