import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  name: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  delay?: number;
}

const StockCard = ({ name, symbol, qty, avgPrice, currentPrice, delay = 0 }: StockCardProps) => {
  const pnl = (currentPrice - avgPrice) * qty;
  const pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
  const isProfit = pnl >= 0;
  const animClass = delay === 0 ? "animate-fade-in" : delay === 1 ? "animate-fade-in-delay-1" : delay === 2 ? "animate-fade-in-delay-2" : "animate-fade-in-delay-3";

  return (
    <div className={`glass-card gradient-border p-5 opacity-0 ${animClass} transition-all duration-300 hover:scale-[1.02] ${isProfit ? "hover:glow-green" : "hover:glow-red"}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{symbol}</h3>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>
        <div className={`rounded-full p-1.5 ${isProfit ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
          {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Qty</p>
          <p className="text-sm font-medium">{qty}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Avg Price</p>
          <p className="text-sm font-medium">₹{avgPrice.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Current</p>
          <p className="text-sm font-medium">₹{currentPrice.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">P&L</p>
          <p className={`text-sm font-bold ${isProfit ? "text-profit" : "text-loss"}`}>
            {isProfit ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            <span className="ml-1 text-[10px] font-medium">
              ({isProfit ? "+" : ""}{pnlPercent.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
