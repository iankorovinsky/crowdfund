"use client";
import React from "react";
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
import { Upload, Image as ImageIcon, Brain, Bot, Coins, Code, Link, Workflow, GitBranch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { mintAndRegisterIp } from "../scripts/simpleMintAndRegisterSpg";
import payRoyalty from "@/scripts/payRoyalty";

const AGENT_TYPES = [
  "Market Data",
  "Financial Analysis",
  "Portfolio Manager",
] as const;

const ICON_OPTIONS = [
  { value: "brain", label: "Brain", icon: <Brain className="w-4 h-4" /> },
  { value: "bot", label: "Robot", icon: <Bot className="w-4 h-4" /> },
  { value: "coins", label: "Coins", icon: <Coins className="w-4 h-4" /> },
  { value: "code", label: "Code", icon: <Code className="w-4 h-4" /> },
  { value: "link", label: "Link", icon: <Link className="w-4 h-4" /> },
  { value: "workflow", label: "Workflow", icon: <Workflow className="w-4 h-4" /> },
  { value: "gitBranch", label: "Git Branch", icon: <GitBranch className="w-4 h-4" /> },
] as const;

type AgentType = (typeof AGENT_TYPES)[number];
type IconType = (typeof ICON_OPTIONS)[number]["value"];

interface FormType {
  agentName: string;
  description: string;
  agentType: AgentType | undefined;
  pythonFile: File | undefined;
  image?: File;
  input: string;
  output: string;
  icon: IconType | undefined;
}

export function UploadAgent({ className }: { className?: string }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormType>({
    defaultValues: {
      agentName: "",
      description: "",
      agentType: undefined,
      pythonFile: undefined,
      icon: undefined,
      input: "",
      output: "",
    },
    onSubmit: async ({ value }: { value: FormType }) => {
      try {
        const formData = new FormData();
        if (!value.pythonFile || !value.agentType || !value.icon) return;

        formData.append("file", value.pythonFile);
        formData.append("type", value.agentType);
        formData.append("label", value.agentName);
        formData.append("description", value.description);
        formData.append("icon", value.icon);
        if (value.image) {
          formData.append("image", value.image);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-agent`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Agent created, minting IP on Story Protocol:", result);
        const ip_id = await mintAndRegisterIp(value.agentName, value.description);
        const ip_url = `https://explorer.story.foundation/ipa/${ip_id}`;
        window.open(ip_url, '_blank');
        console.log("IP minted and registered on Story Protocol:", ip_url);
        
        const saveIpIdResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/${result.agent_id}/hash`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hash: ip_id }),
        });
        if (!saveIpIdResponse) {
          throw new Error(`Failed to save IP ID: ${saveIpIdResponse}`);
        }
        console.log("IP ID saved to agent!!! Here is the response:", saveIpIdResponse);
        form.reset();

        toast.success("Agent created successfully!", {
          description: `Agent ID: ${result.agent_id}`,
        });
      } catch (err) {
        console.error("Error uploading:", err);
        toast.error("Failed to create agent", {
          description:
            err instanceof Error ? err.message : "Unknown error occurred",
        });
        throw err;
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".py")) {
      form.setFieldValue("pythonFile", file);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className={className}>Upload Agent</Button>
      </DrawerTrigger>
      <DrawerContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="mx-auto w-full max-w-sm mt-4"
        >
          <DrawerHeader>
            <DrawerTitle>Create agent</DrawerTitle>
            <DrawerDescription>
              Earn royalties if your agent performs well
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 p-4 pb-0">
            <form.Field
              name="agentName"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  !value ? "Agent name is required" : undefined,
              }}
            >
              {(field: any) => (
                <div>
                  <Input
                    placeholder="Agent name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={
                      field.state.meta.touchedErrors ? "border-red-500" : ""
                    }
                  />
                  {field.state.meta.touchedErrors && (
                    <p className="text-sm text-red-500 mt-1">
                      {field.state.meta.touchedErrors}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="agentType"
              validators={{
                onChange: ({ value }: { value: AgentType | undefined }) =>
                  !value ? "Agent type is required" : undefined,
              }}
            >
              {(field: any) => (
                <div>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as AgentType)
                    }
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.touchedErrors ? "border-red-500" : ""
                      }
                    >
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
                  {field.state.meta.touchedErrors && (
                    <p className="text-sm text-red-500 mt-1">
                      {field.state.meta.touchedErrors}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="icon"
              validators={{
                onChange: ({ value }: { value: IconType | undefined }) =>
                  !value ? "Icon is required" : undefined,
              }}
            >
              {(field: any) => (
                <div>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as IconType)
                    }
                  >
                    <SelectTrigger
                      className={
                        field.state.meta.touchedErrors ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select icon">
                        {field.state.value && (
                          <div className="flex items-center gap-2">
                            {ICON_OPTIONS.find(opt => opt.value === field.state.value)?.icon}
                            <span>{ICON_OPTIONS.find(opt => opt.value === field.state.value)?.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            {opt.icon}
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors && (
                    <p className="text-sm text-red-500 mt-1">
                      {field.state.meta.touchedErrors}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  !value ? "Description is required" : undefined,
              }}
            >
              {(field: any) => (
                <div>
                  <textarea
                    placeholder="Description"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`min-h-[100px] w-full rounded-md border ${
                      field.state.meta.touchedErrors
                        ? "border-red-500"
                        : "border-gray-700"
                    } bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {field.state.meta.touchedErrors && (
                    <p className="text-sm text-red-500 mt-1">
                      {field.state.meta.touchedErrors}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Python File Upload */}
            <form.Field
              name="pythonFile"
              validators={{
                onChange: ({ value }: { value: File | undefined }) =>
                  !value ? "Python file is required" : undefined,
              }}
            >
              {(field: any) => (
                <div
                  className="relative group cursor-pointer"
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
                  <div
                    className={`
                      flex items-center justify-center w-full p-4 
                      border-2 border-dashed rounded-lg
                      transition-all duration-200
                      ${
                        field.state.value
                          ? "border-blue-500/50 bg-blue-500/10"
                          : field.state.meta.touchedErrors
                            ? "border-red-500"
                            : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload
                        className={`w-6 h-6 ${
                          field.state.value ? "text-blue-400" : "text-gray-400"
                        }`}
                      />
                      <div className="text-sm text-center">
                        {field.state.value ? (
                          <span className="text-blue-400">
                            {field.state.value.name}
                          </span>
                        ) : (
                          <>
                            <span className="text-blue-400 font-medium">
                              Upload Python file
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              Python files only (.py)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {field.state.meta.touchedErrors && (
                    <p className="text-sm text-red-500 mt-1">
                      {field.state.meta.touchedErrors}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <DrawerFooter className="mt-3 mb-6">
            <Button
              type="submit"
              disabled={form.state.isSubmitting || !form.state.canSubmit}
            >
              {form.state.isSubmitting ? "Uploading..." : "Submit"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
