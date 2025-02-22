from fastapi import APIRouter
import time
import hashlib
import hmac
import requests
import base64
import json
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os
from pydantic import BaseModel

load_dotenv()

API_URL = 'https://demo-futures.kraken.com/derivatives'
API_KEY = 'hCoQq+WfWbwvUQapx/kBBUuN0te27+gBln6OwiiE8gGl5QrrsfwNdSAt'
API_SECRET = '8eZJMGjLCDinGPDIYiX/dSBdxYMTn+z+aN4Cka1gdw/BrgYaCKjL9tZj0xx+R76Un/GCCLJuSy0c8RBuFe4k5Wro'

router = APIRouter()

# Add Order model for request validation
class Order(BaseModel):
    symbol: str
    size: float
    order_type: str

def get_nonce():
    return str(int(time.time() * 1000))

def custom_urlencode(params):
    encoded_params = []
    for key, value in params.items():
        if isinstance(value, list):
            for item in value:
                encoded_params.append(f"{key}={item}")
        else:
            encoded_params.append(f"{key}={value}")
    return '&'.join(encoded_params)

def sign_message(path, data, nonce):
    message = data + nonce + path
    sha256_hash = hashlib.sha256(message.encode('utf-8')).digest()
    secret = base64.b64decode(API_SECRET)
    hmac_sha512 = hmac.new(secret, sha256_hash, hashlib.sha512)
    return base64.b64encode(hmac_sha512.digest()).decode()

def place_order(symbol, order_type, size, side, leverage=None, limit_price=None, stop_price=None, cliOrdId=None, trigger_signal=None):
    path = '/api/v3/sendorder'
    nonce = get_nonce()
    process_before_time = (datetime.now(timezone.utc) + timedelta(seconds=30)).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    
    data = {
        "processBefore": process_before_time,
        "orderType": order_type,
        "symbol": symbol,
        "side": side,
        "size": size 
    }
    
    if leverage is not None:
        data['leverage'] = leverage
    
    if limit_price is not None:
        data['limitPrice'] = limit_price
    
    if stop_price is not None:
        data['stopPrice'] = stop_price
    
    if cliOrdId is not None:
        data['cliOrdId'] = cliOrdId
    
    if trigger_signal is not None:
        data['triggerSignal'] = trigger_signal
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'APIKey': API_KEY,
        'Authent': sign_message(path, custom_urlencode(data), nonce),
        'Nonce': nonce
    }
    
    # Logging request details for debugging
    print("Request URL:", API_URL + path)
    print("Request Headers:", json.dumps(headers, indent=4))
    print("Request Body:", data)
    
    response = requests.post(API_URL + path, headers=headers, data=data)
    
    # Logging response details
    print("Response Status Code:", response.status_code)
    print("Response Text:", response.text)
    
    return response.json()

def get_data(symbol: str):
    headers = {
        'Accept': 'application/json'
    }
    response = requests.get(
        f"https://futures.kraken.com/derivatives/api/v3/tickers/{symbol}", 
        headers=headers
    )
    return response.json()


def get_balance():
    path = '/api/v3/accounts'
    nonce = get_nonce()
    payload = {
    }
    headers = {
        'Accept': 'application/json',
        'APIKey': API_KEY,
        'Authent': sign_message(path, custom_urlencode(payload), nonce),
        'Nonce': nonce
    }
    response = requests.get(API_URL + path, headers=headers, data=payload).json()
    balances = response["accounts"]["cash"]["balances"]
    balances = {k.upper():v for k,v in balances.items()}
    return balances
    
# symbol = 'pi_ethusd'  # ETHUSD perpetual future
# order_type = 'mkt'    # Market order
# size = 1           # Size of the order
# side = 'buy'          # Buy order

@router.post("/buy/")
def place_buy_order(order: Order):  # Changed function name to match the action
    return place_order(order.symbol, order.order_type, order.size, 'buy')

@router.post("/sell/")
def place_sell_order(order: Order):
    return place_order(order.symbol, order.order_type, order.size, 'sell')

@router.get("/get_data/")  # Changed to GET request since we're fetching data
async def get_market_data(symbol: str):  # Changed function name to be more descriptive
    return get_data(symbol)

@router.get("/get_balance/")
def get_account_balance():
    return get_balance()

