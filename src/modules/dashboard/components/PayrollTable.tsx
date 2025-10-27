import { Pencil } from "lucide-react";
import { ScrollArea, ScrollViewport, Scrollbar } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { currencyFormatter, formatDisplayDate } from "../../../lib/utils";
import type { CalculatedPayrollRecord } from "../../../utils/finance";
import type { ClientCompany, Nurse } from "../../../types";

interface PayrollTableProps {
  records: CalculatedPayrollRecord[];
  nurses: Nurse[];
  clients: ClientCompany[];
  currency: string;
  onEdit: (record: CalculatedPayrollRecord) => void;
}

export const PayrollTable = ({
  records,
  nurses,
  clients,
  currency,
  onEdit,
}: PayrollTableProps) => {
  if (!records.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-300">
        No payroll records for the selected month. Add a record to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03]">
      <ScrollArea className="w-full">
        <ScrollViewport>
          <table className="min-w-full border-separate border-spacing-y-2 px-4 py-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                <th className="px-4 py-2">Nurse</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2 text-right">Contract</th>
                <th className="px-4 py-2 text-right">Billed</th>
                <th className="px-4 py-2 text-right">Payable</th>
                <th className="px-4 py-2 text-right">Profit</th>
                <th className="px-4 py-2">Days</th>
                <th className="px-4 py-2" aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const nurse = nurses.find((item) => item.id === record.nurseId);
                const client = clients.find((item) => item.id === record.clientId);
                const profitPositive = record.profit >= 0;
                return (
                  <tr
                    key={record.id}
                    className="rounded-2xl bg-slate-900/70 text-sm text-slate-100 shadow-inner shadow-black/5"
                  >
                    <td className="rounded-l-2xl px-4 py-4 align-top">
                      <div className="font-semibold text-white">{nurse?.name ?? "Unassigned"}</div>
                      <div className="text-xs text-slate-400">
                        {record.fullMonth ? "Full month" : `${record.daysWorked} working days`}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-slate-200">{client?.name ?? "Unknown"}</div>
                      {client?.trn ? (
                        <div className="text-xs text-slate-400">TRN: {client.trn}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-right align-top font-medium text-slate-200">
                      {currencyFormatter(record.contractAmount, currency)}
                    </td>
                    <td className="px-4 py-4 text-right align-top font-medium text-slate-200">
                      {currencyFormatter(record.billedAmount, currency)}
                    </td>
                    <td className="px-4 py-4 text-right align-top text-slate-200">
                      <div>{currencyFormatter(record.payableAmount, currency)}</div>
                      <div className="text-xs text-slate-400">
                        OT {currencyFormatter(record.overtimeAmount, currency)} · Trans {currencyFormatter(record.transportationAmount, currency)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <div
                        className={profitPositive ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}
                      >
                        {currencyFormatter(record.profit, currency)}
                      </div>
                      <Badge
                        variant={profitPositive ? "success" : "danger"}
                        className="mt-2 inline-flex"
                      >
                        {profitPositive ? "Profitable" : "Review"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-slate-300">
                      <div>{formatDisplayDate(record.startDate)}</div>
                      <div>{formatDisplayDate(record.endDate)}</div>
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 align-top">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl border border-white/10 bg-white/5 text-xs"
                        onClick={() => onEdit(record)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollViewport>
        <Scrollbar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
