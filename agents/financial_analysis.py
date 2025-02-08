from langchain_openai import ChatOpenAI
from langchain import hub
from langchain.agents import create_tool_calling_agent
from langchain.agents import AgentExecutor
from langchain_community.tools.tavily_search import TavilySearchResults
from dotenv import load_dotenv
import sys

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
agent_executor = AgentExecutor(agent=agent, tools=tools)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python financial_analysis.py <market_information>")
        sys.exit(1)
    
    market_information = sys.argv[1]

    # Invoke the agent with the market information
    response = agent_executor.invoke({
        "input": (
            f"{market_information}"
            "Use all the tools provided to retrieve information available for the company upon today. Analyze the positive developments "
            "and potential concerns of the company with 2-4 most important factors respectively and keep them concise. Most factors should "
            "be inferred from company related news. Then make a rough prediction (e.g. up/down by 2-3%) of the the company's stock price "
            "movement for next week. Provide a summary analysis to support your prediction. This summary should be concise and clear and "
            "formatted such that it can be understood by an AI agent."
        )
    })

    # Print the response
    print(response["output"])