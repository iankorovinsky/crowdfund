from langchain_openai import ChatOpenAI
from langchain import hub
from langchain.agents import create_tool_calling_agent
from langchain.agents import AgentExecutor
from dotenv import load_dotenv
import requests
from langchain_core.tools import Tool
import sys

# Load environment variables from .env file
load_dotenv()

def get_data(symbol: str):
    headers = {
        'Accept': 'application/json'
    }
    response = requests.get(
        f"https://futures.kraken.com/derivatives/api/v3/tickers/{symbol}", 
        headers=headers
    )
    return response.json()

# Initialize search tool
tools = [
    Tool(
        name="get_data",
        func=get_data,
        description="Get the latest market data for a given symbol"
    )
]

# Initialize language model
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)

# Pull the prompt from the hub
prompt = hub.pull("hwchase17/openai-functions-agent")

# Create the agent and executor
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python market_data.py <symbol>")
        sys.exit(1)
    
    symbol = sys.argv[1]

    # Invoke the agent with the market information
    response = agent_executor.invoke({
        "input": (
            f"Get the latest market data for the symbol {symbol}."
            "Use all the tools provided to retrieve information available for the company upon today."
        )
    })

    # Print the response
    print(response["output"])