import time
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from workflow import get_workflow_status, run_workflow
import uuid
from database import initialize_db, create_agent, get_agent, get_all_agents, update_agent_type, delete_agent, migrate_db, update_agent_label
from cloudflare import upload_file_to_r2, delete_file_from_r2
from kraken import router as kraken_router
from pydantic import BaseModel
from typing import List
from helpers import copy_env_to_tmp, get_node_input_and_output
from xrpl_token import XRPLTokenManager

class Position(BaseModel):
    x: float
    y: float

class Node(BaseModel):
    id: str
    agent_id: str
    type: str
    position: Position

class Edge(BaseModel):
    id: str
    source: str
    target: str
    type: str

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class WorkflowRequest(BaseModel):
    workflow: Workflow
    symbol: str

app = FastAPI()
app.include_router(kraken_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and migrate database
initialize_db()
migrate_db()  # Run migration again to ensure it's up to date
copy_env_to_tmp()

# Initialize token manager asynchronously
token_manager = None

@app.on_event("startup")
async def startup_event():
    global token_manager
    token_manager = await XRPLTokenManager()

@app.get("/")
async def root():
    await token_manager.issue_token(1)
    time.sleep(1)
    await token_manager.issue_token(1)
    return {"message": "Hello World"}

@app.post("/run-workflow")
async def post_run_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks):
    workflow_id = str(uuid.uuid4())
    background_tasks.add_task(run_workflow, workflow_id, request.workflow.dict(), request.symbol)
    return { "workflow_id": workflow_id }

@app.get("/workflow-status/{workflow_id}")
async def workflow_status(workflow_id: str):
    return get_workflow_status(workflow_id)

@app.post("/create-agent")
async def upload_python_file(
    file: UploadFile = File(...),
    type: str = Form(...),
    label: str = Form(...),
    description: str = Form(...),
    icon: str = Form(...),
):
    agent_id = str(uuid.uuid4())
    
    # Handle Python file
    file_location = f"/tmp/crowdfund/{agent_id}.py"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    # Upload Python file to R2
    upload_file_to_r2(file_location, f"{agent_id}.py")

    node_input, node_output = get_node_input_and_output(type)
    
    create_agent(agent_id, type, label, description, node_input, node_output, icon)

    return {
        "success": True,
        "info": f"file '{agent_id}' saved at '{file_location}' and uploaded to R2",
        "agent_id": agent_id,
    }

@app.get("/agent/{agent_id}")
async def get_agent_info(agent_id: str):
    return get_agent(agent_id)

@app.get("/agents")
async def get_agents():
    return get_all_agents()

@app.put("/agent/{agent_id}/type")
async def update_agent_type_endpoint(agent_id: str, type: str = Form(...)):
    update_agent_type(agent_id, type)
    return {"info": f"Agent '{agent_id}' type updated to '{type}'"}

@app.put("/agent/{agent_id}/label")
async def update_agent_label_endpoint(agent_id: str, label: str = Form(...)):
    update_agent_label(agent_id, label)
    return {"info": f"Agent '{agent_id}' label updated to '{label}'"}

@app.delete("/agent/{agent_id}")
async def delete_agent_endpoint(agent_id: str):
    delete_agent(agent_id)
    delete_file_from_r2(f"{agent_id}.py")
    return {"info": f"Agent '{agent_id}' and associated file deleted successfully"}
