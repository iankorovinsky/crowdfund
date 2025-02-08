import requests

url = "https://apt-polished-raptor.ngrok-free.app/create-agent/"
file_path = '/Users/adriangri/programming/crowdfund/agents/portfolio_manager.py'
data = {
    "type": "Portfolio Manager",
    "label": "Portfolio Manager Node 1 Verbose",
    "description": "A node that decides the best trades to make based on the analysis",
    "input": "analysis",
    "output": "decision"
}

with open(file_path, 'rb') as file:
    files = {'file': file}
    response = requests.post(url, files=files, data=data)

print(response.status_code)
print(response.json())