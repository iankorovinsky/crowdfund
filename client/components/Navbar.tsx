"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UploadAgent } from "@/components/UploadAgent";
import { Copy, Home, Wallet } from "lucide-react";
import { useState } from "react";
import { LoadingScreen } from "./LoadingScreen";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const PortfolioDialog = dynamic(() => import('./PortfolioDialog'), { ssr: false });

interface NavbarProps {
  roomId: string;
}

export function Navbar({ roomId }: NavbarProps) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push('/');
  };

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/get_balance");
      const data = await response.json();
      setPortfolio(data);
      setShowPortfolio(true);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen LoadingText="Rerouting to your home page"/>}
      <nav className="absolute left-80 right-0 h-16 z-50 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div onClick={handleHomeClick} className="cursor-pointer">
          <Home className="text-gray-600 hover:text-gray-400 transition-all duration-300" />
        </div>
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchBalance}
            disabled={isLoading}
            className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Portfolio
          </Button>
        </div>
      </nav>
      <PortfolioDialog 
        open={showPortfolio} 
        onOpenChange={setShowPortfolio}
        portfolio={portfolio}
      />
    </>
  );
}
