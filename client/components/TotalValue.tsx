"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface Holding {
  name: string
  symbol: string
  amount: number
  value: number
  change24h: number
}

interface TotalValueProps {
  holdings: Holding[]
}

export function TotalValue({ holdings }: TotalValueProps) {
  const totalValue = useMemo(() => holdings.reduce((sum, holding) => sum + holding.value, 0), [holdings])
  const totalChange = useMemo(() => {
    const totalInitialValue = holdings.reduce((sum, holding) => sum + holding.value / (1 + holding.change24h / 100), 0)
    return ((totalValue - totalInitialValue) / totalInitialValue) * 100
  }, [holdings, totalValue])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6 mb-6"
    >
      <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Portfolio Value</h3>
      <div className="flex items-end">
        <p className="text-4xl font-bold text-white">${totalValue.toLocaleString()}</p>
        <p className={`ml-4 text-lg ${totalChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {totalChange >= 0 ? "+" : ""}
          {totalChange.toFixed(2)}%
        </p>
      </div>
    </motion.div>
  )
}