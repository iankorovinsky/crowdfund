"use client";

import { Handle, Position } from "@xyflow/react";
import { useStore } from "@/lib/store";
import { Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRADING_PAIRS = [
  "PI_XBTUSD",
  "PI_BTCUSD",
  "PI_ETHUSD",
  "PI_LTCUSD",
  "PI_BCHUSD",
  "PF_SOLUSD",
  "PF_SUSHIUSD",
  "PF_XRPUSD",
  "PF_COMPUSD",
] as const;

type TradingPair = (typeof TRADING_PAIRS)[number];

interface TradingNodeData {
  label: string;
  description: string;
  symbol?: TradingPair;
}

interface TradingNodeProps {
  id: string;
  data: TradingNodeData;
}

export default function TradingNode({ id, data }: TradingNodeProps) {
  const updateNodeData = useStore((state) => state.updateNodeData);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-green-500/30 shadow-lg min-w-[200px] hover:border-green-500/50 transition-all duration-300">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-green-500" />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-900/50 to-green-800/30">
            <Coins className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-green-100">{data.label}</h3>
        </div>
        <p className="text-sm text-green-300/70 mb-4">{data.description}</p>

        <Select
          value={data.symbol}
          onValueChange={(value: TradingPair) => {
            updateNodeData(id, {
              ...data,
              symbol: value,
            });
          }}
        >
          <SelectTrigger className="w-full bg-gray-900/50 border-green-900 hover:border-green-700 transition-colors duration-300">
            <SelectValue placeholder="Select symbol" className="text-green-300/70" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-green-900">
            {TRADING_PAIRS.map((pair) => (
              <SelectItem
                key={pair}
                value={pair}
                className="text-green-200 hover:bg-green-900/30 focus:bg-green-900/30 focus:text-green-100"
              >
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
