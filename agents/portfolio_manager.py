from langchain_openai import ChatOpenAI
from langchain import hub
from langchain.agents import create_tool_calling_agent
from langchain.agents import AgentExecutor
from langchain_community.tools.tavily_search import TavilySearchResults
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize search tool
search = TavilySearchResults()
tools = [search]

# Initialize language model
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)

# Pull the prompt from the hub
prompt = hub.pull("hwchase17/openai-functions-agent")

# Create the agent and executor
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Define market information
analysis_summary = (
    "### Positive Developments:\n"
    "1. **Apple's Fiscal First-Quarter Earnings:** Apple reported fiscal first-quarter earnings, settling back into a familiar range between $205 and $235.\n"
    "2. **Analyst Ratings:** Analysts have a positive outlook on Apple, with an average price target of $242.36 and a 'Buy' rating from 33 stock analysts.\n\n"
    "### Potential Concerns:\n"
    "1. **Market Regulation Probe:** Reports of China's State Administration for Market Regulation preparing a potential probe into Apple's App Store fees and practices, focusing on its 30% commission on in-app spending.\n"
    "2. **Trade Tensions:** Escalating trade tensions between the U.S. and China, marked by recent tariff impositions, impacting Apple's stock performance.\n\n"
    "### Prediction:\n"
    "Given the positive analyst ratings and Apple's stable earnings, coupled with the concerns around regulatory scrutiny and trade tensions, it is predicted that Apple's stock price may experience a slight decline of around 2-3% next week. This prediction is based on the current market conditions and the potential impact of regulatory challenges and trade uncertainties on Apple's stock performance."
)

# Instructions for the agent
instructions = (
    "Based on the provided market analysis, make a decision to buy or sell the stock. DO NOT CONDUCT ANY FURTHER ANALYSIS, SIMPLY OUTPUT AN OBJECT OF THIS FORM { orderType: string, symbol: string, side: string, size: number }. DO NOT OUTPUT ANY OTHER CONTENT, JUST THIS OBJECT.\n\n"
    "orderType: string\n"
    "Possible values: [lmt, post, ioc, mkt, stp, take_profit, trailing_stop]\n"
    "The order type:\n"
    "lmt - a limit order\n"
    "post - a post-only limit order\n"
    "mkt - an immediate-or-cancel order with 1% price protection\n"
    "stp - a stop order\n"
    "take_profit - a take profit order\n"
    "ioc - an immediate-or-cancel order\n"
    "trailing_stop - a trailing stop order\n\n"
    "symbol: string\n"
    "The symbol of the Futures\n\n"
    "side: string\n"
    "Possible values: [buy, sell]\n\n"
    "size: number\n"
    "The size associated with the order. Note that different Futures have different contract sizes."
)

# Invoke the agent with the market information and instructions
response = agent_executor.invoke({
    "input": f"{instructions}\n\n{analysis_summary}"
})

# Print the response
print(response)