from typing_extensions import TypedDict
from langgraph.graph import START, StateGraph, END
import subprocess
import os

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
    nodes_ran: list[str]

# Function to run a file with subprocess
def run_node_script(workflow_id: str, node_name: str, state: State):
    script_path = f"/tmp/crowdfund/{node_name}.py"

    # check if file exists
    if not os.path.exists(script_path):
        update_workflow_status(workflow_id, node_name, WorkflowStatus.ERROR)
        return {"nodes_ran": state["nodes_ran"]}
    
    update_workflow_status(workflow_id, node_name, WorkflowStatus.IN_PROGRESS)
    result = subprocess.run(["python3", script_path], capture_output=True, text=True)
    update_workflow_status(workflow_id, node_name, WorkflowStatus.COMPLETED)
    add_workflow_log(workflow_id, node_name, result.stdout.strip())
    
    return {"nodes_ran": state["nodes_ran"] + [node_name]}

# Parse react_flow.txt
def parse_react_flow(workflow: dict):
    return workflow['nodes'], workflow['edges']

# Build the graph
def build_graph(workflow_id: str, nodes: list, edges: list):
    graph_builder = StateGraph(State)
    node_names = [node["id"] for node in nodes]

    for node_name in node_names:
        graph_builder.add_node(
            node=node_name, 
            action=lambda state, node_name=node_name: run_node_script(workflow_id, node_name, state)
        )

    nodes_no_input = set(node_names)

    for edge in edges:
        node1, node2 = edge["source"], edge["target"]
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
    graph.invoke({"nodes_ran": []})

    return {"success": True}

def update_workflow_status(workflow_id: str, node_id: str, status: WorkflowStatus):
    if node_id not in workflow_statuses[workflow_id]:
        workflow_statuses[workflow_id][node_id] = { "status": WorkflowStatus.NOT_STARTED, "logs": [] }

    workflow_statuses[workflow_id][node_id]["status"] = status

def add_workflow_log(workflow_id: str, node_id: str, log: str):
    if node_id not in workflow_statuses[workflow_id]:
        workflow_statuses[workflow_id][node_id] = { "status": WorkflowStatus.NOT_STARTED, "logs": [] }

    workflow_statuses[workflow_id][node_id]["logs"].append(log)

def get_workflow_status(workflow_id: str):
    return workflow_statuses.get(workflow_id, {})