import { PieChart, TrendingUp } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { currencyFormatter } from "../../../lib/utils";
import type { ClientCompany } from "../../../types";

interface AnalyticsSummaryProps {
  monthLabel: string;
  summary: {
    billedIncome: number;
    nurseExpenses: number;
    grossProfit: number;
    staffCost: number;
    netProfit: number;
    profitMargin: number;
    activeRecords: number;
    totalClients: number;
  };
  breakdown: {
    client: ClientCompany;
    income: number;
    expenses: number;
    profit: number;
    margin: number;
  }[];
  currency: string;
}

export const AnalyticsSidebar = ({ monthLabel, summary, breakdown, currency }: AnalyticsSummaryProps) => (
  <div className="space-y-6">
    <Card className="bg-slate-900/70">
      <h3 className="text-base font-semibold text-white">Financial Snapshot</h3>
      <p className="mt-1 text-sm text-slate-300">Overview for {monthLabel}</p>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Gross Profit</span>
          <span className="text-lg font-semibold text-white">
            {currencyFormatter(summary.grossProfit, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Net Profit</span>
          <span className="text-lg font-semibold text-emerald-300">
            {currencyFormatter(summary.netProfit, currency)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
          <div>
            <p className="font-semibold text-white">{summary.activeRecords}</p>
            <p className="text-slate-400">Active Records</p>
          </div>
          <div>
            <p className="font-semibold text-white">{summary.totalClients}</p>
            <p className="text-slate-400">Total Clients</p>
          </div>
          <div>
            <p className="font-semibold text-white">
              {currencyFormatter(summary.nurseExpenses, currency)}
            </p>
            <p className="text-slate-400">Nurse Expenses</p>
          </div>
          <div>
            <p className="font-semibold text-white">
              {currencyFormatter(summary.staffCost, currency)}
            </p>
            <p className="text-slate-400">Staff Salaries</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-emerald-100">
          <TrendingUp className="h-5 w-5" />
          <div>
            <p className="text-xs uppercase tracking-wide">Margin</p>
            <p className="text-lg font-semibold">
              {summary.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Card>

    <Card className="bg-slate-900/70">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Client Profitability</h3>
        <Badge variant="soft" className="flex items-center gap-1">
          <PieChart className="h-4 w-4" />
          {breakdown.length} Clients
        </Badge>
      </div>
      <div className="mt-4 space-y-4">
        {breakdown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-300">
            No client records yet for the selected month.
          </p>
        ) : (
          breakdown.map((entry) => (
            <div
              key={entry.client.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{entry.client.name}</p>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Margin {entry.margin.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <p className="text-slate-400">Income</p>
                  <p className="font-semibold text-white">
                    {currencyFormatter(entry.income, currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <p className="text-slate-400">Expenses</p>
                  <p className="font-semibold text-white">
                    {currencyFormatter(entry.expenses, currency)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Profit</span>
                <span
                  className={entry.profit >= 0 ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}
                >
                  {currencyFormatter(entry.profit, currency)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  </div>
);
