import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: "profit" | "loss" | "neutral";
  subtext?: string;
  className?: string;
  delay?: number;
}

const MetricCard = ({ label, value, icon: Icon, trend = "neutral", subtext, className = "", delay = 0 }: MetricCardProps) => {
  const glowClass = trend === "profit" ? "glow-green" : trend === "loss" ? "glow-red" : "glow-blue";
  const trendColor = trend === "profit" ? "text-profit" : trend === "loss" ? "text-loss" : "text-primary";
  const animClass = delay === 0 ? "animate-fade-in" : delay === 1 ? "animate-fade-in-delay-1" : delay === 2 ? "animate-fade-in-delay-2" : "animate-fade-in-delay-3";

  return (
    <div className={`glass-card gradient-border p-5 ${glowClass} opacity-0 ${animClass} transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`rounded-lg bg-secondary p-2 ${trendColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${trendColor}`}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
};

export default MetricCard;
