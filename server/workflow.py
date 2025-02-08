from typing_extensions import TypedDict
from langgraph.graph import START, StateGraph, END
import subprocess
import os
from cloudflare import download_file_from_s3
from database import get_agent

class WorkflowStatus:
    NOT_STARTED = "NOT STARTED"
    IN_PROGRESS = "IN PROGRESS"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

workflow_statuses = {
    "workflow1": {
        "node1": {
            "status": WorkflowStatus.COMPLETED,
            "logs": ["Completed analysis"],
        },
        "node2": {
            "status": WorkflowStatus.IN_PROGRESS,
            "logs": ["Calculting trade"]
        },
        "node3": {
            "status": WorkflowStatus.NOT_STARTED,
            "logs": []
        }
    },
    "workflow2": {
        "node1": {
            "status": WorkflowStatus.COMPLETED,
            "logs": ["Completed analysis"],
        },
        "node2": {
            "status": WorkflowStatus.COMPLETED,
            "logs": ["Completed trade"]
        },
        "node3": {
            "status": WorkflowStatus.IN_PROGRESS,
            "logs": ["Calculating result"]
        }
    },
}

# Define the state schema
class State(TypedDict):
    symbol: str
    market_data: str
    analysis: str
    decision: str

# Function to run a file with subprocess
def run_node_script(workflow_id: str, node_name: str, state: State):
    script_path = f"/tmp/crowdfund/{node_name}.py"

    # check if file exists locally, if not download from S3
    if not os.path.exists(script_path):
        download_file_from_s3(f"{node_name}.py", script_path)

    if not os.path.exists(script_path):
        update_workflow_status(workflow_id, node_name, WorkflowStatus.ERROR)
        return state
    
    agent_data = get_agent(node_name)
    agent_input = state[agent_data["input"]]
    agent_output_name = agent_data["output"]
    
    update_workflow_status(workflow_id, node_name, WorkflowStatus.IN_PROGRESS)
    result = subprocess.run(["python3", script_path, f'"{agent_input}"'], capture_output=True, text=True)
    update_workflow_status(workflow_id, node_name, WorkflowStatus.COMPLETED)
    add_workflow_log(workflow_id, node_name, result.stdout.strip())

    state[agent_output_name] = result.stdout.strip()
    
    return state

# Parse react_flow.txt
def parse_react_flow(workflow: dict):
    return workflow['nodes'], workflow['edges']

# Build the graph
def build_graph(workflow_id: str, nodes: list, edges: list):
    graph_builder = StateGraph(State)
    id_to_agent_id = {node["id"]: node["agent_id"] for node in nodes}
    node_names = [node["agent_id"] for node in nodes]

    for node_name in node_names:
        graph_builder.add_node(
            node=node_name, 
            action=lambda state, node_name=node_name: run_node_script(workflow_id, node_name, state)
        )

    nodes_no_input = set(node_names)

    for edge in edges:
        node1, node2 = id_to_agent_id[edge["source"]], id_to_agent_id[edge["target"]]
        nodes_no_input.discard(node2)
        graph_builder.add_edge(node1, node2)

    for node in nodes_no_input:
        graph_builder.add_edge(START, node)

    return graph_builder.compile()

async def invoke_graph(graph, state):
    return graph.invoke(state)

def run_workflow(workflow_id, workflow: dict):
    # parse the workflow
    nodes, edges = parse_react_flow(workflow)
    graph = build_graph(workflow_id, nodes, edges)

    workflow_statuses[workflow_id] = {}
    
    # invoke graph asynchronously
    graph.invoke({"symbol": "pi_ethusd"})

    return {"success": True}

def update_workflow_status(workflow_id: str, node_id: str, status: WorkflowStatus):
    node_data = get_agent(node_id)
    node_label = node_data["label"]

    if node_label not in workflow_statuses[workflow_id]:
        workflow_statuses[workflow_id][node_label] = { "status": WorkflowStatus.NOT_STARTED, "logs": [] }

    workflow_statuses[workflow_id][node_label]["status"] = status

def add_workflow_log(workflow_id: str, node_id: str, log: str):
    node_data = get_agent(node_id)
    node_label = node_data["label"]

    if node_label not in workflow_statuses[workflow_id]:
        workflow_statuses[workflow_id][node_label] = { "status": WorkflowStatus.NOT_STARTED, "logs": [] }

    workflow_statuses[workflow_id][node_label]["logs"].append(log)

def get_workflow_status(workflow_id: str):
    return workflow_statuses.get(workflow_id, {})