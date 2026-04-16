interface GlowBadgeProps {
  value: number;
  prefix?: string;
}

const GlowBadge = ({ value, prefix = "₹" }: GlowBadgeProps) => {
  const isProfit = value >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isProfit
          ? "bg-profit/10 text-profit"
          : "bg-loss/10 text-loss"
      }`}
    >
      {isProfit ? "+" : ""}{prefix}{Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </span>
  );
};

export default GlowBadge;
