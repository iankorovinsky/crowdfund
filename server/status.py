workflow_statuses = {
    "workflow1": {
        "node1": {
            "status": "COMPLETED",
            "logs": ["Completed analysis"],
        },
        "node2": {
            "status": "IN PROGRESS",
            "logs": ["Calculting trade"]
        },
        "node3": {
            "status": "NOT STARTED",
            "logs": []
        }
    },
    "workflow2": {
        "node1": {
            "status": "COMPLETED",
            "logs": ["Completed analysis"],
        },
        "node2": {
            "status": "COMPLETED",
            "logs": ["Completed trade"]
        },
        "node3": {
            "status": "IN PROGRESS",
            "logs": ["Calculating result"]
        }
    },
}

def get_workflow_status(workflow_id: str):
    return workflow_statuses.get(workflow_id, {})