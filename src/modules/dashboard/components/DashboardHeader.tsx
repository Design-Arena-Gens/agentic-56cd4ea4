import { CalendarDays, Settings, Sparkles } from "lucide-react";
import type { CompanySettings } from "../../../types";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

interface DashboardHeaderProps {
  month: string;
  onMonthChange: (value: string) => void;
  settings: CompanySettings;
  onOpenSettings: () => void;
}

export const DashboardHeader = ({
  month,
  onMonthChange,
  settings,
  onOpenSettings,
}: DashboardHeaderProps) => (
  <header className="mx-auto w-full max-w-7xl px-6 pt-10 pb-6 md:pt-12">
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-glass backdrop-blur-xl md:p-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),transparent)] md:block" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-brand-100">
            <Sparkles className="h-3 w-3" />
            Financial Control Center
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {settings.companyName || "Safe Heaven Health"} Staffing Finance
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 md:text-base">
              Monitor billed revenue, manage payroll and deliver polished invoices for
              every healthcare partner – all in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <label
            htmlFor="month-picker"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-slate-200 shadow-inner shadow-white/10 backdrop-blur-md"
          >
            <CalendarDays className="h-5 w-5 text-brand-200" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-300/80">
                Active Month
              </span>
              <input
                id="month-picker"
                type="month"
                value={month}
                onChange={(event) => onMonthChange(event.target.value)}
                className={cn(
                  "mt-1 w-full cursor-pointer border-none bg-transparent p-0 text-base font-medium text-white focus-visible:outline-none",
                  "[color-scheme:dark]",
                )}
              />
            </div>
          </label>

          <Button
            variant="outline"
            size="lg"
            onClick={onOpenSettings}
            className="border-white/20 bg-white/10 text-sm font-semibold text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  </header>
);
