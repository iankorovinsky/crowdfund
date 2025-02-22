"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UploadAgent } from "@/components/UploadAgent";
import { Copy, Home } from "lucide-react";
import { useState } from "react";
import { LoadingScreen } from "./LoadingScreen";
import { useRouter } from "next/navigation";
import { MinimalHoldingsModal } from "./MinimalHoldingsModal";
import { toast } from "sonner";

interface NavbarProps {
  roomId: string;
  isFull: boolean;
}

export function Navbar({ roomId, isFull }: NavbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push('/');
  };

  return (
    <>
      {isLoading && <LoadingScreen LoadingText="Rerouting to homescreen..."/>}
      <nav className={`absolute right-0 h-16 z-50 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 ${isFull ? "left-80" : "left-0"}`}>
        <div onClick={handleHomeClick} className="cursor-pointer">
          <Home className="text-gray-600 hover:text-gray-400 transition-all duration-300" />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 px-4 py-2 border-gray-700 border flex items-center gap-3 rounded-xl">
            <span className="text-gray-300">Room ID: {roomId}</span>
            <Copy
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                toast.success("Copied to clipboard");
              }}
              className="h-4 w-4 text-gray-500 hover:text-gray-100 cursor-pointer transition-colors"
            />
          </div>
          <UploadAgent className="bg-gray-600 hover:bg-gray-600 hover:scale-[102%] transition-all duration-300 px-3 py-5 text-md rounded-xl" />
          <ConnectButton />
          <MinimalHoldingsModal />
        </div>
      </nav>
    </>
  );
}
