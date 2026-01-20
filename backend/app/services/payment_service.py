import hashlib
import time
from typing import Dict, Any
from urllib.parse import urlencode

class PaymentService:
    PID = "20240907203516"
    PKEY = "5oKz4VDp8fQsv7tLfIIxoVqUJxGdqgnu"
    SUBMIT_URL = "https://zpayz.cn/submit.php"
    
    @staticmethod
    def generate_sign(params: Dict[str, Any]) -> str:
        """
        MD5 Signature Algorithm:
        1. Sort params by key (ASCII).
        2. Join as key=value&key=value (no url encoding).
        3. Append PKEY.
        4. MD5 hash (lowercase).
        """
        # Sort and exclude sign, sign_type and empty values
        sorted_keys = sorted([k for k in params.keys() if k not in ["sign", "sign_type"] and params[k]])
        
        query_string = "&".join([f"{k}={params[k]}" for k in sorted_keys])
        sign_source = query_string + PaymentService.PKEY
        return hashlib.md5(sign_source.encode('utf-8')).hexdigest().lower()

    @staticmethod
    def create_payment_params(user_id: int, out_trade_no: str, name: str, money: float, notify_url: str, return_url: str) -> Dict[str, str]:
        params = {
            "pid": PaymentService.PID,
            "type": "wxpay", # WeChat Pay only
            "out_trade_no": out_trade_no,
            "notify_url": notify_url,
            "return_url": return_url,
            "name": name,
            "money": f"{money:.2f}",
            "param": str(user_id) # Pass user_id back in callback
        }
        params["sign"] = PaymentService.generate_sign(params)
        params["sign_type"] = "MD5"
        return params

    @staticmethod
    def verify_callback(params: Dict[str, Any]) -> bool:
        """
        Verify the callback signature from EasyPay.
        """
        if "sign" not in params:
            return False
        
        received_sign = params["sign"]
        calculated_sign = PaymentService.generate_sign(params)
        
        return received_sign == calculated_sign
