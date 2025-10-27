import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, Printer, BarChart3, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { useData } from "../../../context/DataContext";
import { calculateClientBreakdown, calculateMonthlyFinancials, getMonthLabel, recordMatchesMonth } from "../../../utils/finance";
import { currencyFormatter, formatDisplayDate } from "../../../lib/utils";
import { downloadSectionAsImage, openPrintWindow } from "../../../utils/print";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  month: string;
}

export const ReportModal = ({ open, onClose, month }: ReportModalProps) => {
  const { payrollRecords, nurses, clients, staff, settings } = useData();
  const [reportMonth, setReportMonth] = useState(month);
  const [reportDate, setReportDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setReportMonth(month);
      setReportDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open, month]);

  const monthRecords = useMemo(
    () => payrollRecords.filter((record) => recordMatchesMonth(record, reportMonth)),
    [payrollRecords, reportMonth],
  );

  const monthlyFinancials = useMemo(
    () => calculateMonthlyFinancials(monthRecords, staff, reportMonth),
    [monthRecords, staff, reportMonth],
  );

  const clientBreakdown = useMemo(
    () => calculateClientBreakdown(monthlyFinancials.calculated, clients),
    [monthlyFinancials.calculated, clients],
  );

  const handleDownloadJpeg = async () => {
    if (!reportRef.current) {
      toast.error("Report preview not ready");
      return;
    }
    await downloadSectionAsImage(reportRef.current, `financial-report-${reportMonth}`);
    toast.success("Report downloaded as JPEG");
  };

  const handlePrint = () => {
    if (!reportRef.current) {
      toast.error("Report preview not ready");
      return;
    }
    openPrintWindow(reportRef.current.outerHTML, `Financial Report ${reportMonth}`);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[95vh] w-full max-w-5xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Financial Report</DialogTitle>
          <p className="text-sm text-slate-300">
            Produce a comprehensive print-ready statement for internal review or board reporting.
          </p>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <Label>Report Month</Label>
              <Input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Report Date</Label>
              <Input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>Income: <strong>{currencyFormatter(monthlyFinancials.billedIncome, settings.currency)}</strong></p>
              <p>Nurse Expenses: <strong>{currencyFormatter(monthlyFinancials.nurseExpenses, settings.currency)}</strong></p>
              <p>Staff Salaries: <strong>{currencyFormatter(monthlyFinancials.staffCost, settings.currency)}</strong></p>
              <p>Net Profit: <strong>{currencyFormatter(monthlyFinancials.netProfit, settings.currency)}</strong></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handlePrint} className="rounded-xl">
                <Printer className="h-4 w-4" /> Print / PDF
              </Button>
              <Button type="button" variant="outline" onClick={handleDownloadJpeg} className="rounded-xl">
                <Download className="h-4 w-4" /> Download JPEG
              </Button>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-auto rounded-2xl border border-white/10 bg-white p-8 text-slate-800">
            <div ref={reportRef} className="print-container">
              {settings.headerImage ? (
                <img src={settings.headerImage} alt="Report header" className="header-image" />
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Financial Report · {getMonthLabel(reportMonth)}
                  </h2>
                  <p className="text-sm text-slate-500">Report Date: {formatDisplayDate(reportDate)}</p>
                  <p className="text-sm text-slate-500">Currency: {settings.currency}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{settings.companyName}</p>
                  {settings.companyTrn ? <p>Company TRN: {settings.companyTrn}</p> : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
                  <BarChart3 className="h-4 w-4" /> Financial Summary
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Income</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {currencyFormatter(monthlyFinancials.billedIncome, settings.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Nurse Expenses</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {currencyFormatter(monthlyFinancials.nurseExpenses, settings.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Gross Profit</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">
                      {currencyFormatter(monthlyFinancials.grossProfit, settings.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Net Profit</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">
                      {currencyFormatter(monthlyFinancials.netProfit, settings.currency)}
                    </p>
                    <p className="text-xs text-slate-500">Margin {monthlyFinancials.profitMargin.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs">
                    <p className="font-semibold text-slate-700">Active Records: {monthRecords.length}</p>
                    <p>Unique Clients: {clientBreakdown.length}</p>
                    <p>Total Nurses: {nurses.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs">
                    <p className="font-semibold text-slate-700">Staff Salaries</p>
                    <ul className="mt-2 space-y-1">
                      {staff.length ? (
                        staff.map((member) => (
                          <li key={member.id} className="flex justify-between">
                            <span>{member.name}</span>
                            <span>{currencyFormatter(member.monthlySalary, settings.currency)}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500">No staff recorded.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="section-title">Client Profitability</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Profit</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientBreakdown.length ? (
                      clientBreakdown.map((entry) => (
                        <tr key={entry.client.id}>
                          <td>{entry.client.name}</td>
                          <td>{currencyFormatter(entry.income, settings.currency)}</td>
                          <td>{currencyFormatter(entry.expenses, settings.currency)}</td>
                          <td>{currencyFormatter(entry.profit, settings.currency)}</td>
                          <td>{entry.margin.toFixed(1)}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No clients recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h3 className="section-title">Payroll Records</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th>Nurse</th>
                      <th>Client</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Days</th>
                      <th>Billed</th>
                      <th>Payable</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyFinancials.calculated.length ? (
                      monthlyFinancials.calculated.map((record) => {
                        const nurse = nurses.find((item) => item.id === record.nurseId);
                        const client = clients.find((item) => item.id === record.clientId);
                        return (
                          <tr key={record.id}>
                            <td>{nurse?.name ?? "Nurse"}</td>
                            <td>{client?.name ?? "Client"}</td>
                            <td>{formatDisplayDate(record.startDate)}</td>
                            <td>{formatDisplayDate(record.endDate)}</td>
                            <td>{record.daysWorked}</td>
                            <td>{currencyFormatter(record.billedAmount, settings.currency)}</td>
                            <td>{currencyFormatter(record.payableAmount, settings.currency)}</td>
                            <td>{currencyFormatter(record.profit, settings.currency)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          No payroll records available for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <Users className="h-4 w-4" /> Staff Salaries Overview
                </div>
                <p className="mt-2">
                  Total Staff Cost: {currencyFormatter(monthlyFinancials.staffCost, settings.currency)}
                </p>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                {settings.contactNote || "For queries, contact finance@safeheavenhealth.com"}
              </p>

              {settings.footerImage ? (
                <img src={settings.footerImage} alt="Report footer" className="footer-image" />
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
