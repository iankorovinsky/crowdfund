"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Holding {
  name: string
  symbol: string
  amount: number
  value: number
  change24h: number
}

interface HoldingsGridProps {
  holdings: Holding[]
}

export function HoldingsGrid({ holdings }: HoldingsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {holdings.map((holding, index) => (
        <motion.div
          key={holding.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{holding.name}</h3>
              <p className="text-sm text-gray-400">{holding.symbol}</p>
            </div>
            <div className={`flex items-center ${holding.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {holding.change24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="ml-1 text-sm">{Math.abs(holding.change24h)}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">${holding.value.toLocaleString()}</p>
          <p className="text-sm text-gray-400">
            {holding.amount} {holding.symbol}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

