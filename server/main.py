from fastapi import FastAPI, UploadFile, File, BackgroundTasks
import os
from workflow import get_workflow_status, run_workflow
import uuid

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/run-workflow")
async def post_run_workflow(body: dict, background_tasks: BackgroundTasks):
    workflow_id = str(uuid.uuid4())
    background_tasks.add_task(run_workflow, workflow_id, body["workflow"])

    return { "workflow_id": workflow_id }

@app.get("/workflow-status/{workflow_id}")
async def workflow_status(workflow_id: str):
    return get_workflow_status(workflow_id)

@app.post("/upload-file")
async def upload_python_file(file: UploadFile = File(...)):
    file_location = f"/tmp/crowdfund/{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}
