"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function UploadAgent() {
  const [agentName, setAgentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".py")) {
        setError("Please upload a Python (.py) file");
        setSelectedFile(null);
      } else {
        setError("");
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!agentName.trim()) {
      setError("Please enter an agent name");
      return;
    }
    if (!selectedFile) {
      setError("Please upload a Python file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8000/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      setAgentName("");
      setSelectedFile(null);
      setError("");
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Error uploading:", err);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger>
        <Button className="absolute bottom-5 left-5 bg-blue-500 px-6 py-3">
          Upload agent
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm mt-4">
          <DrawerHeader>
            <DrawerTitle>Create agent</DrawerTitle>
            <DrawerDescription>
              Earn royalties if your agent performs well
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4 pb-0">
            <Input
              type="text"
              placeholder="Agent name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <Input type="file" accept=".py" onChange={handleFileChange} />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <DrawerFooter className="mt-3 mb-6">
            <Button
              onClick={handleSubmit}
              disabled={!agentName.trim() || !selectedFile}
            >
              Submit
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
