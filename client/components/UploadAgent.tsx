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
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const AGENT_TYPES = ["Data", "Financial Analysis", "Portfolio Manager", "Personality", "XRP"] as const;
type AgentType = typeof AGENT_TYPES[number];

export function UploadAgent({className} : {className?: string}) {
  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [agentType, setAgentType] = useState<AgentType | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (!agentType) {
      setError("Please select an agent type");
      return;
    }
    if (!selectedFile) {
      setError("Please upload a Python file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", agentName);
      formData.append("description", description);
      formData.append("type", agentType);

      const response = await fetch("http://localhost:8000/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setAgentName("");
      setDescription("");
      setAgentType("");
      setSelectedFile(null);
      setError("");
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Error uploading:", err);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className={className}>
          Upload Agent
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
          <div className="flex flex-col gap-4 p-4 pb-0">
            <Input
              type="text"
              placeholder="Agent name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <Select
              value={agentType}
              onValueChange={(value: string) => setAgentType(value as AgentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                {AGENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div 
              className="relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".py"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload Python file"
              />
              <div className={`
                flex items-center justify-center w-full p-4 
                border-2 border-dashed rounded-lg cursor-pointer
                transition-all duration-200
                ${selectedFile 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}
              `}>
                <div className="flex flex-col items-center gap-2">
                  <Upload className={`w-6 h-6 ${selectedFile ? 'text-blue-400' : 'text-gray-400'}`} />
                  <div className="text-sm text-center">
                    {selectedFile ? (
                      <span className="text-blue-400">{selectedFile.name}</span>
                    ) : (
                      <>
                        <span className="text-blue-400 font-medium">Click to upload</span>
                        <span className="text-gray-400"> or drag and drop</span>
                      </>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Python files only (.py)</p>
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <DrawerFooter className="mt-3 mb-6">
            <Button
              onClick={handleSubmit}
              disabled={!agentName.trim() || !description.trim() || !agentType || !selectedFile}
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
