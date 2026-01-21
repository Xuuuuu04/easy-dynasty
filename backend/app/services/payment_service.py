import hashlib
from app.services.settings_service import SettingsService

class PaymentService:
    @staticmethod
    def generate_sign(params: dict) -> str:
        app_key = SettingsService.get("ZPAY_APP_KEY")
        # ZPay 签名算法逻辑 (示例)
        sorted_keys = sorted(params.keys())
        sign_str = "&".join([f"{k}={params[k]}" for k in sorted_keys if k != 'sign' and params[k]])
        sign_str += app_key
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

    @staticmethod
    def create_order_url(user_id: int, tier: str, amount: float):
        app_id = SettingsService.get("ZPAY_APP_ID")
        api_url = SettingsService.get("ZPAY_API_URL")
        
        # 实际开发中会构建完整的请求参数发送给 ZPay
        # 这里返回一个模拟的支付链接
        return f"{api_url}?appid={app_id}&amount={amount}&out_trade_no=ORDER_{user_id}_{tier}"