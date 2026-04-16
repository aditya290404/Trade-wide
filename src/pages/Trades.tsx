import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { TradeWidget } from "@/components/TradeWidget";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Trades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        const res = await fetchApi("/trade");
        if (res.status === "success" && res.data?.trades) {
          setTrades(res.data.trades);
        }
      } catch (err) {
        console.error("Failed to load trades", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadTrades();
    } else {
      setTrades([]);
      setIsLoading(false);
    }
  }, [user]); // Re-fetches whenever the user state changes (like after a trade!)

  const totalTrades = trades.length;
  const totalBuyVolume = trades.filter(t => t.type === 'BUY').reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalSellVolume = trades.filter(t => t.type === 'SELL').reduce((sum, t) => sum + (t.price * t.quantity), 0);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Trade History</h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
        <p className="mt-3 text-sm text-muted-foreground">Your complete trading activity and performance metrics.</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="opacity-0 animate-fade-in-delay-1">
          <TradeWidget />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 opacity-0 animate-fade-in-delay-2">
          <MetricCard 
            label="Total Trades" 
            value={String(totalTrades)} 
            icon={BarChart3} 
            delay={0} 
          />
          <MetricCard
            label="Total Buy Volume"
            value={`₹${totalBuyVolume.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            icon={TrendingDown}
            trend="loss"
            delay={1}
          />
          <div className="sm:col-span-2">
            <MetricCard 
              label="Total Sell Volume" 
              value={`₹${totalSellVolume.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} 
              icon={TrendingUp} 
              trend="profit" 
              delay={2} 
            />
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="glass-card overflow-hidden opacity-0 animate-fade-in-delay-2 min-h-[300px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="p-12 text-center text-muted-foreground">
            Please sign in to view your trade history.
          </div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No trades executed yet. Use the Trade Desk above to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-5 py-4 text-left font-semibold text-muted-foreground">Stock</th>
                  <th className="px-5 py-4 text-left font-semibold text-muted-foreground">Type</th>
                  <th className="px-5 py-4 text-right font-semibold text-muted-foreground">Price</th>
                  <th className="px-5 py-4 text-right font-semibold text-muted-foreground">Qty</th>
                  <th className="px-5 py-4 text-right font-semibold text-muted-foreground">Total Value</th>
                  <th className="px-5 py-4 text-right font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const totalValue = t.price * t.quantity;
                  const isBuy = t.type === 'BUY';
                  
                  return (
                    <tr
                      key={t.id}
                      className={`border-b border-border/30 transition-colors duration-200 hover:bg-secondary/50 ${
                        isBuy ? "hover:bg-loss/[0.03]" : "hover:bg-profit/[0.03]"
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-foreground tracking-wide">{t.symbol}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${isBuy ? "bg-loss/10 text-loss" : "bg-profit/10 text-profit"}`}>
                          {isBuy ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {t.type}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground">
                        ₹{t.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground">{t.quantity}</td>
                      <td className={`px-5 py-3.5 text-right font-medium ${isBuy ? "text-loss" : "text-profit"}`}>
                        {isBuy ? "-" : "+"}₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground text-xs">
                        {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trades;
