from typing_extensions import TypedDict
from langgraph.graph import START, StateGraph, END
import subprocess
import json
import os

# Parse react_flow.txt
nodes = {}
edges = {}

with open('react_flow.txt') as f:
    graph = json.load(f)
    nodes = graph['nodes']
    edges = graph['edges']

# Define the state schema
class State(TypedDict):
    output: str

graph_builder = StateGraph(State)

# Function to run a file with subprocess
def run_node_script(node_name: str, state: State):
    script_path = os.path.join(os.path.dirname(__file__), 'nodes', f"{node_name}.py")
    result = subprocess.run(["python3", script_path], capture_output=True, text=True)
    return {"output": state["output"] + result.stdout.strip()}

node_names = []

for node in nodes:
    node_name = node["id"]
    node_names.append(node_name)
    graph_builder.add_node(node=node_name, action=lambda state, node_name=node_name: run_node_script(node_name, state))

nodes_no_input = set(node_names)

for edge in edges:
    node1, node2 = edge["source"], edge["target"]
    nodes_no_input.discard(node2)
    graph_builder.add_edge(node1, node2)

for node in nodes_no_input:
    graph_builder.add_edge(START, node)

# Compile the graph
graph = graph_builder.compile()

# Invoke the graph with initial state
print(graph.invoke({"output": ""}))