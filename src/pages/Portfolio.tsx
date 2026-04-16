import { useState, useEffect } from "react";
import { Wallet, TrendingUp, IndianRupee, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/MetricCard";
import StockCard from "@/components/StockCard";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";



const chartData = [
  { date: "Jan", value: 480000 },
  { date: "Feb", value: 495000 },
  { date: "Mar", value: 510000 },
  { date: "Apr", value: 498000 },
  { date: "May", value: 525000 },
  { date: "Jun", value: 540000 },
  { date: "Jul", value: 535000 },
  { date: "Aug", value: 558000 },
  { date: "Sep", value: 572000 },
  { date: "Oct", value: 565000 },
  { date: "Nov", value: 590000 },
  { date: "Dec", value: 612500 },
];

const Portfolio = () => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    balance: 100000,
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalPnL: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const res = await fetchApi("/portfolio");
        if (res.status === "success" && res.data?.portfolio) {
          setHoldings(res.data.portfolio.holdings || []);
          setMetrics({
            balance: res.data.portfolio.balance || 0,
            totalInvestment: res.data.portfolio.totalInvestment || 0,
            totalCurrentValue: res.data.portfolio.currentValue || 0,
            totalPnL: res.data.portfolio.totalProfitLoss || 0
          });
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadPortfolio();
    } else {
      setIsLoading(false);
      setHoldings([]);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-24 text-center opacity-0 animate-fade-in">
        <div className="mx-auto max-w-md glass-card p-12 glow-border">
           <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
           <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
           <p className="text-muted-foreground">Please sign in from the navigation bar to view your live portfolio and holdings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
      </div>

      {/* Hero Value */}
      <div className="mb-8 glass-card gradient-border p-8 text-center opacity-0 animate-fade-in glow-blue">
        <p className="text-sm font-medium text-muted-foreground">Total Portfolio Value</p>
        <p className="mt-2 text-5xl font-extrabold gradient-text tracking-tight">
          ₹{metrics.totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </p>
        <p className={`mt-2 text-sm font-semibold ${metrics.totalPnL >= 0 ? "text-profit" : "text-loss"}`}>
          {metrics.totalPnL >= 0 ? "+" : ""}₹{metrics.totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 2 })} 
          {metrics.totalInvestment > 0 ? ` (${((metrics.totalPnL / metrics.totalInvestment) * 100).toFixed(2)}%)` : ''}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Invested Value" value={`₹${metrics.totalInvestment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} icon={Wallet} delay={0} />
        <MetricCard label="Total P&L" value={`${metrics.totalPnL >= 0 ? "+" : ""}₹${metrics.totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} icon={TrendingUp} trend={metrics.totalPnL >= 0 ? "profit" : "loss"} delay={1} />
        <MetricCard label="Available Balance" value={`₹${metrics.balance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} icon={IndianRupee} delay={2} />
      </div>

      {/* Chart */}
      <div className="mb-8 glass-card gradient-border p-6 opacity-0 animate-fade-in-delay-2">
        <h2 className="mb-4 text-lg font-semibold">Portfolio Growth</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(230, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(230, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 18%)" />
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(228, 25%, 10%)",
                  border: "1px solid hsl(228, 15%, 22%)",
                  borderRadius: "12px",
                  color: "hsl(210, 40%, 96%)",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Value"]}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(230, 80%, 60%)" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings */}
      <div className="opacity-0 animate-fade-in-delay-3">
        <h2 className="mb-4 text-lg font-semibold">Holdings ({holdings.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {holdings.length === 0 ? (
            <p className="text-muted-foreground col-span-full">You have no holdings yet. Visit the Trade page to buy stocks.</p>
          ) : (
            holdings.map((h, i) => (
              <StockCard key={h.symbol} name={h.symbol} symbol={h.symbol} qty={h.quantity} avgPrice={h.avgPrice} currentPrice={h.currentPrice} delay={Math.min(i % 4, 3)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
