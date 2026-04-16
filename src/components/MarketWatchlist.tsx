import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MarketItem {
  symbol: string;
  price: number;
  change: number;
}

const MarketWatchlist = () => {
  const [market, setMarket] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMarket = async () => {
    try {
      const res = await fetchApi("/market/overview");
      if (res.status === "success" && res.data?.market) {
        setMarket(res.data.market);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch market overview", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card gradient-border overflow-hidden glow-blue opacity-0 animate-fade-in-delay-1">
      <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-profit animate-pulse" />
          <h3 className="font-bold tracking-tight">Live Market Watch</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button onClick={fetchMarket} className="text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {isLoading && market.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ) : (
          market.map((stock) => (
            <div
              key={stock.symbol}
              className="group flex items-center justify-between px-6 py-4 transition-all duration-300 hover:bg-secondary/40"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/50 font-bold text-xs group-hover:border-primary/50 transition-colors">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{stock.symbol}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equity • Live</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-mono font-bold text-sm tracking-tight">
                    ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`flex items-center justify-end text-[10px] font-bold ${stock.change >= 0 ? "text-profit" : "text-loss"}`}>
                    {stock.change >= 0 ? <TrendingUp className="mr-1 h-2.5 w-2.5" /> : <TrendingDown className="mr-1 h-2.5 w-2.5" />}
                    {stock.change > 0 ? "+" : ""}{stock.change}%
                  </p>
                </div>
                <Link to="/trades">
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary hover:text-white">
                     <ArrowRight className="h-4 w-4" />
                   </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-secondary/20 px-6 py-3 text-center border-t border-border/50">
        <Link to="/trades" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
          View All Active Markets
        </Link>
      </div>
    </div>
  );
};

export default MarketWatchlist;
