"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientOnly from "./ClientOnly";

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Record<string, number>;
}

export default function PortfolioDialog({ open, onOpenChange, portfolio }: PortfolioDialogProps) {
  return (
    <ClientOnly>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Portfolio</DialogTitle>
            <div className="space-y-2 pt-3">
              {Object.entries(portfolio).map(([currency, amount]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-400">{currency}</span>
                  <span className="text-xl font-semibold text-white">{amount}</span>
                </div>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
} 