"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UploadAgent } from "@/components/UploadAgent";
import { Copy, Home } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  roomId: string;
}

export function Navbar({ roomId }: NavbarProps) {
  return (
    <nav className="absolute left-80 right-0 h-16 z-50 bg-gray-950 bg-opacity-50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4">
              <Link href="/">
          <Home className="text-gray-600 hover:text-gray-400 transition-all duration-300 cursor-pointer" />
        </Link>
      <div className="flex items-center gap-4">
        <div className="bg-gray-800 px-4 py-2 border-gray-700 border flex items-center gap-3 rounded-xl">
          <span className="text-gray-300">Room ID: {roomId}</span>
          <Copy
            onClick={() => {
              navigator.clipboard.writeText(roomId);
            }}
            className="h-4 w-4 text-gray-500 hover:text-gray-100 cursor-pointer transition-colors"
          />
        </div>
        <UploadAgent className="bg-gray-600 hover:bg-gray-600 hover:scale-[102%] transition-all duration-300 px-6 py-5 text-md rounded-xl" />
        <ConnectButton />
      </div>
    </nav>
  );
}
