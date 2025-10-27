import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  gradient: string;
  icon: LucideIcon;
}

export const MetricCard = ({
  label,
  value,
  trend,
  gradient,
  icon: IconComponent,
}: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="relative overflow-hidden bg-slate-900/70">
      <div className="absolute inset-0 bg-gradient-to-br opacity-[0.15] blur-3xl" />
      <div className="relative flex flex-col gap-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg shadow-brand-500/20">
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {trend ? (
            <span
              className={cn(
                "mt-3 inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200",
                `bg-gradient-to-r ${gradient} bg-clip-text text-transparent`,
              )}
            >
              {trend}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  </motion.div>
);
