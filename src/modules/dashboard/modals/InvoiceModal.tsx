import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Printer, Download, Building2, BadgeCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { useData } from "../../../context/DataContext";
import { calculateRecordFinancials, getMonthLabel, getNextInvoiceNumber, recordMatchesMonth } from "../../../utils/finance";
import { currencyFormatter, formatDisplayDate } from "../../../lib/utils";
import { downloadSectionAsImage, openPrintWindow } from "../../../utils/print";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  month: string;
}

export const InvoiceModal = ({ open, onClose, month }: InvoiceModalProps) => {
  const { clients, nurses, payrollRecords, settings } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id ?? "");
  const [invoiceMonth, setInvoiceMonth] = useState(month);
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [invoiceNumber, setInvoiceNumber] = useState(() => getNextInvoiceNumber(payrollRecords.length));

  const invoiceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedClientId((value) => value || clients[0]?.id || "");
      setInvoiceMonth(month);
      setInvoiceDate(format(new Date(), "yyyy-MM-dd"));
      setInvoiceNumber(getNextInvoiceNumber(payrollRecords.length));
    }
  }, [open, clients, month, payrollRecords.length]);

  const monthRecords = useMemo(
    () =>
      payrollRecords.filter((record) =>
        recordMatchesMonth(record, invoiceMonth) && record.clientId === selectedClientId,
      ),
    [payrollRecords, invoiceMonth, selectedClientId],
  );

  const calculated = useMemo(
    () => monthRecords.map((record) => calculateRecordFinancials(record, invoiceMonth)),
    [monthRecords, invoiceMonth],
  );

  const client = clients.find((item) => item.id === selectedClientId);
  const subtotal = calculated.reduce((sum, record) => sum + record.billedAmount, 0);
  const vatAmount = subtotal * ((settings.vatRate ?? 0) / 100);
  const total = subtotal + vatAmount;

  const handleDownloadJpeg = async () => {
    if (!invoiceRef.current) {
      toast.error("Invoice preview not ready");
      return;
    }
    await downloadSectionAsImage(invoiceRef.current, `invoice-${invoiceNumber}`);
    toast.success("Invoice downloaded as JPEG");
  };

  const handlePrint = () => {
    if (!invoiceRef.current) {
      toast.error("Invoice preview not ready");
      return;
    }
    openPrintWindow(invoiceRef.current.outerHTML, `Invoice ${invoiceNumber}`);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[95vh] w-full max-w-5xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Generate Tax Invoice</DialogTitle>
          <p className="text-sm text-slate-300">
            Create a branded invoice ready for print or digital delivery. Header and footer imagery come from settings.
          </p>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((clientItem) => (
                    <SelectItem key={clientItem.id} value={clientItem.id}>
                      {clientItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Invoice Month</Label>
              <Input type="month" value={invoiceMonth} onChange={(event) => setInvoiceMonth(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Subtotal: <strong>{currencyFormatter(subtotal, settings.currency)}</strong>
              </p>
              <p>
                VAT ({settings.vatRate}%): <strong>{currencyFormatter(vatAmount, settings.currency)}</strong>
              </p>
              <p>
                Total: <strong>{currencyFormatter(total, settings.currency)}</strong>
              </p>
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
            <div ref={invoiceRef} className="print-container">
              {settings.headerImage ? (
                <img src={settings.headerImage} alt="Invoice header" className="header-image" />
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Tax Invoice for {getMonthLabel(invoiceMonth)}
                  </h2>
                  <p className="text-sm text-slate-500">Invoice Date: {formatDisplayDate(invoiceDate)}</p>
                  <p className="text-sm text-slate-500">Invoice #: {invoiceNumber}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{settings.companyName}</p>
                  {settings.companyTrn ? <p>Company TRN: {settings.companyTrn}</p> : null}
                  <p>Currency: {settings.currency}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Building2 className="h-4 w-4" /> Client
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-900">{client?.name ?? "Select a client"}</p>
                  {client?.trn ? <p className="text-sm text-slate-600">TRN: {client.trn}</p> : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <BadgeCheck className="h-4 w-4" /> Company
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-900">{settings.companyName}</p>
                  {settings.bankCompanyTrn ? (
                    <p className="text-sm text-slate-600">Company TRN: {settings.bankCompanyTrn}</p>
                  ) : null}
                </div>
              </div>

              <table className="mt-8 w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Nurse</th>
                    <th className="text-left">Start Date</th>
                    <th className="text-left">End Date</th>
                    <th className="text-left">Days</th>
                    <th className="text-right">Amount ({settings.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {calculated.length ? (
                    calculated.map((record) => {
                      const nurse = nurses.find((item) => item.id === record.nurseId);
                      return (
                        <tr key={record.id}>
                          <td>{nurse?.name ?? "Nurse"}</td>
                          <td>{formatDisplayDate(record.startDate)}</td>
                          <td>{formatDisplayDate(record.endDate)}</td>
                          <td>{record.daysWorked}</td>
                          <td className="text-right">{currencyFormatter(record.billedAmount, settings.currency)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No payroll records for the selected client and month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <table className="summary-table text-sm">
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td>{currencyFormatter(subtotal, settings.currency)}</td>
                    </tr>
                    <tr>
                      <td>VAT ({settings.vatRate}%)</td>
                      <td>{currencyFormatter(vatAmount, settings.currency)}</td>
                    </tr>
                    <tr className="highlight">
                      <td>Total Amount</td>
                      <td>{currencyFormatter(total, settings.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Bank Details</h3>
                <p className="mt-2">Bank: {settings.bankName || "Update in settings"}</p>
                <p>Account: {settings.bankAccountNumber || "Update in settings"}</p>
                <p>IBAN: {settings.iban || "Update in settings"}</p>
                {settings.bankCompanyTrn ? <p>Company TRN: {settings.bankCompanyTrn}</p> : null}
              </div>

              <p className="mt-6 text-xs text-slate-500">
                {settings.contactNote || "For queries, contact finance@safeheavenhealth.com"}
              </p>

              {settings.footerImage ? (
                <img src={settings.footerImage} alt="Invoice footer" className="footer-image" />
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
