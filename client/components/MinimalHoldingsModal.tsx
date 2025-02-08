"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HoldingsList } from "./HoldingsList"
import { TOKEN_PRICES } from "@/lib/constants"
import { toast } from "sonner"

interface Holding {
  symbol: string
  amount: number
  value: number
  change24h: number
}

export function MinimalHoldingsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchHoldings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/get_balance")
      if (!response.ok) throw new Error("Failed to fetch balance")
      
      const balances: Record<string, number> = await response.json()
      
      const newHoldings: Holding[] = Object.entries(balances)
        .filter(([symbol, amount]) => amount > 0)
        .map(([symbol, amount]) => {
          const priceInfo = TOKEN_PRICES[symbol] || { usdPrice: 0, change24h: 0 }
          return {
            symbol,
            amount,
            value: amount * priceInfo.usdPrice,
            change24h: priceInfo.change24h
          }
        })
        .sort((a, b) => b.value - a.value)

      setHoldings(newHoldings)
    } catch (error) {
      console.error("Error fetching holdings:", error)
      toast.error("Failed to fetch holdings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchHoldings()
    }
  }, [isOpen])

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="bg-gray-800 hover:bg-gray-700 hover:scale-[102%] transition-all duration-300 px-3 py-5 text-md rounded-xl"
        disabled={isLoading}
      >
        View Holdings
      </Button>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[320px] bg-gray-900 border border-gray-800 p-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <DialogHeader className="flex flex-row items-center space-y-0 pb-3 border-b border-gray-800">
                  <DialogTitle className="text-lg font-semibold text-white">
                    Holdings
                  </DialogTitle>
                </DialogHeader>
                <div className="my-3">
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">${totalValue.toLocaleString()}</p>
                </div>
                <HoldingsList holdings={holdings} />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

