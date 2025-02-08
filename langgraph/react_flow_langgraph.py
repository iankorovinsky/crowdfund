from typing_extensions import TypedDict
from langgraph.graph import START, StateGraph, END
import subprocess
import json
import os

# Define the state schema
class State(TypedDict):
    output: str

# Function to run a file with subprocess
def run_node_script(node_name: str, state: State):
    script_path = os.path.join(os.path.dirname(__file__), 'nodes', f"{node_name}.py")
    result = subprocess.run(["python3", script_path], capture_output=True, text=True)
    return {"output": state["output"] + result.stdout.strip()}

# Parse react_flow.txt
def parse_react_flow(file_path: str):
    with open(file_path) as f:
        graph = json.load(f)
    return graph['nodes'], graph['edges']

# Build the graph
def build_graph(nodes, edges):
    graph_builder = StateGraph(State)
    node_names = [node["id"] for node in nodes]

    for node_name in node_names:
        graph_builder.add_node(node=node_name, action=lambda state, node_name=node_name: run_node_script(node_name, state))

    nodes_no_input = set(node_names)

    for edge in edges:
        node1, node2 = edge["source"], edge["target"]
        nodes_no_input.discard(node2)
        graph_builder.add_edge(node1, node2)

    for node in nodes_no_input:
        graph_builder.add_edge(START, node)

    return graph_builder.compile()

# Main execution
if __name__ == "__main__":
    nodes, edges = parse_react_flow('react_flow.txt')
    graph = build_graph(nodes, edges)
    print(graph.invoke({"output": ""}))