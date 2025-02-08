from fastapi import FastAPI
from status import get_workflow_status

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/workflow-status/{workflow_id}")
async def read_item(workflow_id: str):
    return get_workflow_status(workflow_id)