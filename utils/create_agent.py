import requests
url = "http://localhost:8000/create-agent/"
file_path = '/Users/adriangri/programming/crowdfund/agents/portfolio_manager.py'
data = {
    "type": "Financial Analysis",
    "label": "Directed Financial Analysis Agent",
    "description": "An agent that provides financial analysis for a given symbol based on market data.",
    "icon": "robot",
    "input": "market_data",
    "output": "analysis"
}

with open(file_path, 'rb') as file:
    files = {'file': file}
    response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.json())