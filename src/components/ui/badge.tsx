import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "danger" | "soft";
}

type BadgeVariant = Exclude<BadgeProps["variant"], undefined>;

export const Badge = ({
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-brand-500/80 text-white",
    outline: "border border-brand-400/50 text-brand-100",
    success: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30",
    danger: "bg-rose-500/20 text-rose-200 border border-rose-400/30",
    soft: "bg-white/10 text-white border border-white/10",
  };

  const variantKey = variant ?? "default";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variantKey],
        className,
      )}
      {...props}
    />
  );
};
