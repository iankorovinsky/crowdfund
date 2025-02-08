python -m venv .venv

Windows:

cd venv/Scripts
./activate
../../

Mac:
source .venv/bin/activate
pip install fastapi fastapi-cli

Run FastAPI Server:
fastapi dev main.py

For Kraken API:
Getdata: GET from /get_data/?symbol="your_symbol"
Buy/Sell: POST from /buy/ or /sell/
Schema for Buy/Sell:
{
    "symbol": "your_symbol",
    "order_type": "your_order_type",
    "size": "your_size"
}



