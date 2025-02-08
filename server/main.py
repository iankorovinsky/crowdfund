from fastapi import FastAPI, UploadFile, File
import os
from status import get_workflow_status

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/workflow-status/{workflow_id}")
async def read_item(workflow_id: str):
    return get_workflow_status(workflow_id)

@app.post("/upload-file")
async def upload_python_file(file: UploadFile = File(...)):
    file_location = f"/tmp/crowdfund/{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}