import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";

export function TradeWidget() {
  const { user, refreshUser } = useAuth();
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState<number | "">("");
  const [price, setPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [isTrading, setIsTrading] = useState(false);

  const fetchPrice = async (ticker: string) => {
    if (!ticker) return;
    setIsFetchingPrice(true);
    try {
      const res = await fetchApi(`/market/${ticker.toUpperCase()}`);
      if (res.status === "success" && res.data && typeof res.data.currentPrice === 'number') {
        setPrice(res.data.currentPrice);
      } else {
        setPrice(null);
      }
    } catch {
      setPrice(null);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrice(symbol);
    }, 500);
    return () => clearTimeout(timer);
  }, [symbol]);

  const handleTrade = async (action: "buy" | "sell") => {
    if (!user) {
      toast.error("Please sign in to execute trades from the Navbar");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    setIsTrading(true);
    try {
      const res = await fetchApi(`/trade/${action}`, {
        method: "POST",
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: Number(quantity),
        }),
      });

      if (res.status === "success") {
        toast.success(`Successfully ${action === "buy" ? "bought" : "sold"} ${quantity} shares of ${symbol.toUpperCase()}`);
        setQuantity("");
        refreshUser();
      }
    } catch (err: any) {
      toast.error(err.message || "Trade failed");
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="glass-card gradient-border p-6 shadow-xl relative overflow-hidden">
      {!user && (
        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-background/40 flex flex-col items-center justify-center rounded-2xl">
           <div className="bg-background border border-border/50 shadow-2xl p-4 rounded-xl text-center">
             <p className="font-semibold mb-2">Authentication Required</p>
             <p className="text-sm text-muted-foreground">Please Sign In from the Top Right to trade</p>
           </div>
        </div>
      )}
      
      <div className="mb-4 flex items-center justify-between relative z-0">
        <h3 className="text-xl font-bold tracking-tight">Trade Desk</h3>
        <Button variant="ghost" size="icon" onClick={() => fetchPrice(symbol)} disabled={isFetchingPrice} title="Refresh Price">
          <RefreshCcw className={`h-4 w-4 ${isFetchingPrice ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-4 relative z-0">
        <div className="space-y-2">
          <Label>Stock Symbol</Label>
          <Input 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
            placeholder="e.g. AAPL, TSLA" 
            className="font-mono uppercase transition-all"
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-secondary/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Current Market Price</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground glow-text transition-all duration-300">
            {typeof price === 'number' ? `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "---"}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))} 
            placeholder="0" 
            min="1"
          />
        </div>

        {typeof price === 'number' && quantity && quantity > 0 && (
          <div className="flex justify-between text-sm py-2 px-1 border-t border-border/20 mt-2">
            <span className="text-muted-foreground font-medium">Est. Total Cost</span>
            <span className="font-bold text-foreground tracking-tight">
              ₹{(price * Number(quantity)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            className="w-full bg-profit hover:bg-profit/90 text-white shadow-lg shadow-profit/20 transition-transform hover:scale-[1.02]" 
            onClick={() => handleTrade("buy")}
            disabled={isTrading || !price || !quantity}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> BUY
          </Button>
          <Button 
            className="w-full bg-loss hover:bg-loss/90 text-white shadow-lg shadow-loss/20 transition-transform hover:scale-[1.02]" 
            onClick={() => handleTrade("sell")}
            disabled={isTrading || !price || !quantity}
          >
            <TrendingDown className="mr-2 h-4 w-4" /> SELL
          </Button>
        </div>
      </div>
    </div>
  );
}
