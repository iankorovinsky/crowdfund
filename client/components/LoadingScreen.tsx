import { Loader2 } from "lucide-react";

export function LoadingScreen({ LoadingText = "Preparing your workspace" }: { LoadingText?: string }) {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 relative">
        {/* Animated rings */}
        <div className="absolute inset-0 -m-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20 duration-1000" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/10 duration-700" />
        </div>
        
        {/* Main content */}
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-lg text-gray-300 mt-4 animate-pulse">
            Loading
            <span className="inline-flex animate-bounce">.</span>
            <span className="inline-flex animate-bounce delay-100">.</span>
            <span className="inline-flex animate-bounce delay-200">.</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {LoadingText}
          </p>
        </div>
      </div>
    </div>
  );
} 