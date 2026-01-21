import pymysql
from app.core.config import settings

def upgrade_db_enterprise():
    conn = pymysql.connect(
        host=settings.DB_HOST, user=settings.DB_USER, password=settings.DB_PASSWORD,
        port=int(settings.DB_PORT), database=settings.DB_NAME
    )
    cursor = conn.cursor()
    
    enterprise_settings = [
        # ZPay
        ('ZPAY_APP_ID', '10000', 'Payment', 'ZPay 商户 ID'),
        ('ZPAY_APP_KEY', 'xsy19507', 'Payment', 'ZPay 商户密钥'),
        ('ZPAY_API_URL', 'https://api.zpay.com/v1/gateway/pay', 'Payment', 'ZPay 接口地址'),
        
        # Email (QQ)
        ('MAIL_USERNAME', '3534455350@qq.com', 'Email', '发件人邮箱'),
        ('MAIL_PASSWORD', 'qdicisgrxfizdbbh', 'Email', '邮箱授权码/口令'),
        ('MAIL_FROM', '3534455350@qq.com', 'Email', '显示发件人地址'),
        ('MAIL_PORT', '465', 'Email', 'SMTP 端口 (QQ 建议 465)'),
        ('MAIL_SERVER', 'smtp.qq.com', 'Email', 'SMTP 服务器地址')
    ]
    
    cursor.executemany("INSERT INTO system_settings (`key`, `value`, `category`, `description`) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE description=VALUES(description)", enterprise_settings)
    conn.commit()
    conn.close()
    print("Enterprise Settings Injected.")

if __name__ == "__main__":
    upgrade_db_enterprise()