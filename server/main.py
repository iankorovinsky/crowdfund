from fastapi import FastAPI
from pydantic import BaseModel
import time
import hmac
import hashlib
import base64
import requests
import json
import datetime
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()
API_KEY = os.getenv("API_KEY")
API_SECRET = os.getenv("API_SECRET")
BASE_URL = os.getenv("BASE_URL")

class OrderRequest(BaseModel):
    symbol: str
    size: float
    limit_price: float | None = None  # Optional for market orders

def get_signature(endpoint: str, data: dict) -> str:
    # Convert data to JSON string with sorted keys and no whitespace
    post_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
    
    # Concatenate endpoint, post_data, and nonce in correct order
    message = endpoint + post_data
    
    # Hash with SHA256
    sha256_hash = hashlib.sha256(message.encode('utf-8')).digest()
    
    # Sign with HMAC-SHA512
    secret_decoded = base64.b64decode(API_SECRET)
    signature = hmac.new(secret_decoded, sha256_hash, hashlib.sha512).digest()
    
    # Return base64 encoded signature
    return base64.b64encode(signature).decode()

def send_order(order_type: str, order: OrderRequest):
    endpoint = "/derivatives/api/v3/sendorder"
    url = BASE_URL + endpoint
    nonce = str(int(time.time() * 1000))
    
    # Calculate process before time (30 seconds from now)
    process_before_time = (datetime.datetime.now(datetime.timezone.utc) + 
                          datetime.timedelta(seconds=30)).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    
    data = {
        "orderType": "lmt" if order.limit_price else "mkt",
        "symbol": order.symbol,
        "side": order_type,
        "size": str(order.size),  # Convert size to string
        "limitPrice": str(order.limit_price) if order.limit_price else None,
        "cliOrdId": nonce,
        "triggerSignal": "mark",
        "processBefore": process_before_time
    }
    
    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}
    
    headers = {
        "APIKey": API_KEY,
        "Authent": get_signature(endpoint, data),
        "Content-Type": "application/json",
        "Nonce": nonce
    }
    
    print("Request URL:", url)
    print("Request Headers:", json.dumps(headers, indent=2))
    print("Request Body:", json.dumps(data, indent=2))
    
    response = requests.post(url, headers=headers, json=data)
    print("Response Status Code:", response.status_code)
    print("Response Text:", response.text)
    
    return response.json()

@app.post("/buy/")
def place_buy_order(order: OrderRequest):
    return send_order("buy", order)

@app.post("/sell/")
def place_sell_order(order: OrderRequest):
    return send_order("sell", order)