import requests

url = "http://localhost:8000/create-agent/"
file_path = '/Users/adriangri/programming/crowdfund/agents/market_data.py'
data = {
    "type": "Market Data",
    "label": "Market Data Node 1",
    "description": "Get the latest market data for a given symbol",
    "input": "symbol",
    "output": "market_data"
}

with open(file_path, 'rb') as file:
    files = {'file': file}
    response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.json())