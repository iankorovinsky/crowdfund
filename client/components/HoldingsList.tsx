"use client"

import { motion } from "framer-motion"

interface Holding {
  symbol: string
  amount: number
  value: number
  change24h: number
}

interface HoldingsListProps {
  holdings: Holding[]
}

export function HoldingsList({ holdings }: HoldingsListProps) {
  return (
    <div className="space-y-2">
      {holdings.map((holding, index) => (
        <motion.div
          key={holding.symbol}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-white">{holding.symbol}</p>
            <p className="text-xs text-gray-400">{holding.amount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">${holding.value.toLocaleString()}</p>
            <p className={`text-xs ${holding.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {holding.change24h >= 0 ? "+" : ""}
              {holding.change24h.toFixed(2)}%
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

