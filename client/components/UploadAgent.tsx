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
import { Upload, Image as ImageIcon } from "lucide-react";
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

const AGENT_TYPES = [
  "Data",
  "Financial Analysis",
  "Portfolio Manager",
  "Personality",
  "XRP",
] as const;

type AgentType = (typeof AGENT_TYPES)[number];

interface FormType {
  agentName: string;
  description: string;
  agentType: AgentType | undefined;
  pythonFile: File | undefined;
  image?: File;
  input: string;
  output: string;
}

export function UploadAgent({ className }: { className?: string }) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormType>({
    defaultValues: {
      agentName: "",
      description: "",
      agentType: undefined,
      pythonFile: undefined,
      input: "data",
      output: "result"
    },
    onSubmit: async ({ value }: { value: FormType }) => {
      try {
        const formData = new FormData();
        if (!value.pythonFile || !value.agentType) return;

        formData.append("file", value.pythonFile);
        formData.append("type", value.agentType);
        formData.append("label", value.agentName);
        formData.append("description", value.description);
        formData.append("input", value.input);
        formData.append("output", value.output);
        if (value.image) {
          formData.append("image", value.image);
        }

        const response = await fetch("http://localhost:8000/create-agent", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Agent created, minting IP on Story Protocol:", result);
        const ip_url = await mintAndRegisterIp(value.agentName, value.description);
        console.log("IP minted and registered on Story Protocol:", ip_url);
        window.open(ip_url, '_blank');
        form.reset();
        setImagePreview(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      form.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

            {/* Image Upload */}
            <div
              className="relative group cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload agent image"
              />
              <div
                className={`
                  flex items-center justify-center w-full p-4 
                  border-2 border-dashed rounded-lg
                  transition-all duration-200
                  ${
                    imagePreview
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                  }
                `}
              >
                {imagePreview ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">
                        Click to change image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <div className="text-sm text-center">
                      <span className="text-blue-400 font-medium">
                        Upload agent image
                      </span>
                      <span className="text-gray-400"> (optional)</span>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
