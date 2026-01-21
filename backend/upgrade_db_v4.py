import pymysql
from app.core.config import settings

def upgrade_db_v4():
    conn = pymysql.connect(
        host=settings.DB_HOST, user=settings.DB_USER, password=settings.DB_PASSWORD,
        port=int(settings.DB_PORT), database=settings.DB_NAME
    )
    cursor = conn.cursor()
    
    # 强制重新创建系统设置表
    cursor.execute("DROP TABLE IF EXISTS system_settings")
    cursor.execute("""
    CREATE TABLE system_settings (
        `key` VARCHAR(100) PRIMARY KEY,
        `value` TEXT NOT NULL,
        `category` VARCHAR(50) DEFAULT 'general',
        `description` VARCHAR(255),
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)

    initial_settings = [
        ('DEFAULT_LLM_API_KEY', 'sk-xxx', 'LLM', '大模型 API 密钥'),
        ('TAROT_MODEL', 'moonshotai/Kimi-K2-Instruct-0905', 'LLM', '塔罗分析模型名称'),
        ('BAZI_MODEL', 'moonshotai/Kimi-K2-Instruct-0905', 'LLM', '八字分析模型名称'),
        ('LLM_BASE_URL', 'https://api.siliconflow.cn/v1', 'LLM', '大模型 API 基础路径'),
        ('ZPAY_APP_ID', '10000', 'Payment', 'ZPay 商户 ID'),
        ('ZPAY_APP_KEY', 'xxx', 'Payment', 'ZPay 商户密钥'),
        ('FREE_TIER_TAROT_LIMIT', '1', 'Quota', '免费用户每日塔罗额度'),
        ('FREE_TIER_BAZI_LIMIT', '5', 'Quota', '免费用户每日八字额度')
    ]
    
    cursor.executemany("INSERT INTO system_settings (`key`, `value`, `category`, `description`) VALUES (%s, %s, %s, %s)", initial_settings)
    conn.commit()
    conn.close()
    print("V4 Upgrade success.")

if __name__ == "__main__":
    upgrade_db_v4()