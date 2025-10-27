import { useMemo, useState } from "react";
import { BarChart3, FileText, FolderCog, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../context/DataContext";
import {
  calculateClientBreakdown,
  calculateMonthlyFinancials,
  getMonthLabel,
  recordMatchesMonth,
} from "../../utils/finance";
import { downloadCsv } from "../../utils/export";
import { currencyFormatter } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { DashboardHeader } from "./components/DashboardHeader";
import { MetricCard } from "./components/MetricCard";
import { ActionGrid } from "./components/ActionGrid";
import { PayrollTable } from "./components/PayrollTable";
import { AnalyticsSidebar } from "./components/AnalyticsSidebar";
import { NurseModal } from "./modals/NurseModal";
import { StaffModal } from "./modals/StaffModal";
import { ClientModal } from "./modals/ClientModal";
import { PayrollModal } from "./modals/PayrollModal";
import { InvoiceModal } from "./modals/InvoiceModal";
import { ReportModal } from "./modals/ReportModal";
import { SettingsModal } from "./modals/SettingsModal";
import type { PayrollRecord } from "../../types";

type ModalType =
  | "nurse"
  | "staff"
  | "client"
  | "payroll"
  | "invoice"
  | "report"
  | "settings";

type ModalState =
  | { type: "payroll"; payload?: { record?: PayrollRecord } }
  | { type: Exclude<ModalType, "payroll">; payload?: undefined };

const currentMonth = `${new Date().getFullYear()}-${String(
  new Date().getMonth() + 1,
).padStart(2, "0")}`;

const metricCards = [
  {
    key: "billed",
    label: "Total Billed Income",
    icon: FileText,
    gradient: "from-brand-400 to-blue-500",
  },
  {
    key: "gross",
    label: "Gross Profit",
    icon: BarChart3,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    key: "staff",
    label: "Staff Salaries",
    icon: Users,
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    key: "net",
    label: "Net Profit",
    icon: FolderCog,
    gradient: "from-fuchsia-400 to-purple-500",
  },
] as const;

export const Dashboard = () => {
  const data = useData();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [modal, setModal] = useState<ModalState | null>(null);

  const monthlyRecords = useMemo(
    () =>
      data.payrollRecords.filter((record) =>
        recordMatchesMonth(record, selectedMonth),
      ),
    [data.payrollRecords, selectedMonth],
  );

  const monthlyFinancials = useMemo(
    () =>
      calculateMonthlyFinancials(monthlyRecords, data.staff, selectedMonth),
    [monthlyRecords, data.staff, selectedMonth],
  );

  const clientBreakdown = useMemo(
    () => calculateClientBreakdown(monthlyFinancials.calculated, data.clients),
    [monthlyFinancials.calculated, data.clients],
  );

  const activeRecords = monthlyRecords.length;
  const totalClients = data.clients.length;
  const monthLabel = getMonthLabel(selectedMonth);

  const handleExport = () => {
    if (!monthlyFinancials.calculated.length) {
      toast.info("No payroll records available for this month.");
      return;
    }
    downloadCsv(
      monthlyFinancials.calculated,
      data.nurses,
      data.clients,
      data.settings.currency,
      selectedMonth,
    );
    toast.success("Payroll data exported successfully.");
  };

  const openModal = (type: ModalType, payload?: { record?: PayrollRecord }) => {
    if (type === "payroll") {
      setModal({ type, payload });
    } else {
      setModal({ type });
    }
  };

  const closeModal = () => setModal(null);

  const handleEditRecord = (record: PayrollRecord) =>
    openModal("payroll", { record });

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden bg-slate-950/95 pb-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),rgba(15,23,42,0.92))]" />
        <DashboardHeader
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          settings={data.settings}
          onOpenSettings={() => openModal("settings")}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              {...metricCards[0]}
              value={currencyFormatter(
                monthlyFinancials.billedIncome,
                data.settings.currency,
              )}
              trend={monthLabel}
            />
            <MetricCard
              {...metricCards[1]}
              value={currencyFormatter(
                monthlyFinancials.grossProfit,
                data.settings.currency,
              )}
              trend={`Nurse Cost ${currencyFormatter(
                monthlyFinancials.nurseExpenses,
                data.settings.currency,
              )}`}
            />
            <MetricCard
              {...metricCards[2]}
              value={currencyFormatter(
                monthlyFinancials.staffCost,
                data.settings.currency,
              )}
              trend={`${data.staff.length} Employees`}
            />
            <MetricCard
              {...metricCards[3]}
              value={currencyFormatter(
                monthlyFinancials.netProfit,
                data.settings.currency,
              )}
              trend={`Margin ${monthlyFinancials.profitMargin.toFixed(1)}%`}
            />
          </section>

          <ActionGrid
            onAction={(action) => {
              if (action === "export") {
                handleExport();
              } else {
                openModal(action as ModalType);
              }
            }}
          />

          <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="space-y-6 overflow-hidden border-white/5 bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Payroll Records · {monthLabel}
                  </h2>
                  <p className="text-sm text-slate-300">
                    Review invoices, payouts and profitability for each assignment.
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="solid"
                      size="lg"
                      onClick={() => openModal("payroll")}
                      className="bg-brand-gradient shadow-brand-500/30"
                    >
                      <Plus className="h-4 w-4" />
                      New Record
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add a new payroll record</TooltipContent>
                </Tooltip>
              </div>

              <PayrollTable
                records={monthlyFinancials.calculated}
                nurses={data.nurses}
                clients={data.clients}
                currency={data.settings.currency}
                onEdit={handleEditRecord}
              />
            </Card>

            <AnalyticsSidebar
              monthLabel={monthLabel}
              summary={{
                billedIncome: monthlyFinancials.billedIncome,
                nurseExpenses: monthlyFinancials.nurseExpenses,
                grossProfit: monthlyFinancials.grossProfit,
                staffCost: monthlyFinancials.staffCost,
                netProfit: monthlyFinancials.netProfit,
                profitMargin: monthlyFinancials.profitMargin,
                activeRecords,
                totalClients,
              }}
              breakdown={clientBreakdown}
              currency={data.settings.currency}
            />
          </section>
        </main>

        <NurseModal
          open={modal?.type === "nurse"}
          onClose={closeModal}
        />
        <StaffModal
          open={modal?.type === "staff"}
          onClose={closeModal}
        />
        <ClientModal
          open={modal?.type === "client"}
          onClose={closeModal}
        />
        <PayrollModal
          open={modal?.type === "payroll"}
          onClose={closeModal}
          month={selectedMonth}
          currency={data.settings.currency}
          payload={modal?.type === "payroll" ? modal.payload : undefined}
        />
        <InvoiceModal
          open={modal?.type === "invoice"}
          onClose={closeModal}
          month={selectedMonth}
        />
        <ReportModal
          open={modal?.type === "report"}
          onClose={closeModal}
          month={selectedMonth}
        />
        <SettingsModal
          open={modal?.type === "settings"}
          onClose={closeModal}
        />
      </div>
    </TooltipProvider>
  );
};
