import { Link } from "react-router-dom";
import { TrendingUp, BarChart3, Briefcase, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import MarketWatchlist from "@/components/MarketWatchlist";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container py-12">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center opacity-0 animate-fade-in">
        {user ? (
          <div className="mb-6 flex flex-col items-center animate-fade-in gap-1">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">Welcome Back</span>
            <h2 className="text-3xl font-black gradient-text italic tracking-tighter">
              {user.name.split(' ')[0]}
            </h2>
          </div>
        ) : (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" /> Cloud-Native Paper Trading
          </div>
        )}
        <h1 className="text-5xl font-extrabold tracking-tight">
          Learn Trading with <span className="gradient-text">Zero Risk</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Real market data. Virtual money. Build your trading skills on a production-grade platform
          designed for learners and aspiring investors.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105 glow-blue"
          >
            View Portfolio <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/trades"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-secondary/80 hover:scale-105"
          >
            Trade History
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <MarketWatchlist />
      </div>

      {/* Features */}
      <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
        {[
          { icon: BarChart3, title: "Real-Time Data", desc: "Live market prices from NSE/BSE for authentic trading experience." },
          { icon: Shield, title: "Risk-Free Learning", desc: "Practice with ₹10,00,000 virtual balance. No real money involved." },
          { icon: Globe, title: "Cloud Native", desc: "Deployed on modern cloud infra with JWT auth and scalable APIs." },
        ].map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className={`glass-card gradient-border p-6 text-center opacity-0 ${
              i === 0 ? "animate-fade-in-delay-1" : i === 1 ? "animate-fade-in-delay-2" : "animate-fade-in-delay-3"
            } transition-transform duration-300 hover:scale-[1.03]`}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
