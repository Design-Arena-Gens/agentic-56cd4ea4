import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, Calculator, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Badge } from "../../../components/ui/badge";
import { useData } from "../../../context/DataContext";
import type { PayrollRecord } from "../../../types";
import { calculateRecordFinancials, getMonthBounds } from "../../../utils/finance";
import { currencyFormatter } from "../../../lib/utils";

const schema = z
  .object({
    id: z.string().optional(),
    nurseId: z.string().min(1, "Select a nurse"),
    clientId: z.string().min(1, "Select a client"),
    contractAmount: z.coerce.number().min(0, "Contract amount is required"),
    salary: z.coerce.number().min(0, "Salary is required"),
    transportation: z.coerce.number().min(0),
    overtimeDays: z.coerce.number().min(0),
    fines: z.coerce.number().min(0),
    startDate: z.string(),
    endDate: z.string(),
    fullMonth: z.boolean(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type PayrollFormValues = z.infer<typeof schema>;

interface PayrollModalProps {
  open: boolean;
  onClose: () => void;
  payload?: { record?: PayrollRecord } | null;
  month: string;
  currency: string;
}

export const PayrollModal = ({ open, onClose, payload, month, currency }: PayrollModalProps) => {
  const { nurses, clients, upsertPayroll } = useData();
  const editingRecord = payload?.record ?? null;
  const { start, end } = useMemo(() => getMonthBounds(month), [month]);

  const defaultStart = format(start, "yyyy-MM-dd");
  const defaultEnd = format(end, "yyyy-MM-dd");

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      nurseId: "",
      clientId: "",
      contractAmount: 0,
      salary: 0,
      transportation: 0,
      overtimeDays: 0,
      fines: 0,
      startDate: defaultStart,
      endDate: defaultEnd,
      fullMonth: true,
    },
  });

  const [previewMonth, setPreviewMonth] = useState(month);

  useEffect(() => {
    form.reset({
      nurseId: editingRecord?.nurseId ?? "",
      clientId: editingRecord?.clientId ?? "",
      contractAmount: editingRecord?.contractAmount ?? 0,
      salary: editingRecord?.salary ?? 0,
      transportation: editingRecord?.transportation ?? 0,
      overtimeDays: editingRecord?.overtimeDays ?? 0,
      fines: editingRecord?.fines ?? 0,
      startDate: editingRecord?.startDate ?? defaultStart,
      endDate: editingRecord?.endDate ?? defaultEnd,
      fullMonth: editingRecord?.fullMonth ?? true,
      id: editingRecord?.id,
    });
    setPreviewMonth(month);
  }, [editingRecord, form, defaultStart, defaultEnd, month, open]);

  const selectedNurse = nurses.find((nurse) => nurse.id === form.watch("nurseId"));

  useEffect(() => {
    if (selectedNurse && !editingRecord) {
      form.setValue("salary", selectedNurse.defaultSalary);
      form.setValue("transportation", selectedNurse.defaultTransportation);
    }
  }, [selectedNurse, editingRecord, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        nurseId: "",
        clientId: "",
        contractAmount: 0,
        salary: 0,
        transportation: 0,
        overtimeDays: 0,
        fines: 0,
        startDate: defaultStart,
        endDate: defaultEnd,
        fullMonth: true,
      });
    }
  }, [open, form, defaultStart, defaultEnd]);

  const values = form.watch();

  const previewRecord = useMemo(() => {
    if (!values.nurseId || !values.clientId) return null;
    return calculateRecordFinancials(
      {
        id: values.id ?? "preview",
        nurseId: values.nurseId,
        clientId: values.clientId,
        contractAmount: Number(values.contractAmount) || 0,
        salary: Number(values.salary) || 0,
        transportation: Number(values.transportation) || 0,
        overtimeDays: Number(values.overtimeDays) || 0,
        fines: Number(values.fines) || 0,
        startDate: values.startDate,
        endDate: values.endDate,
        fullMonth: values.fullMonth,
        createdAt: new Date().toISOString(),
      },
      previewMonth,
    );
  }, [values, previewMonth]);

  const onSubmit = form.handleSubmit((data: PayrollFormValues) => {
    upsertPayroll({
      ...data,
      contractAmount: Number(data.contractAmount),
      salary: Number(data.salary),
      transportation: Number(data.transportation),
      overtimeDays: Number(data.overtimeDays),
      fines: Number(data.fines),
    });
    toast.success(editingRecord ? "Payroll updated" : "Payroll record added");
    onClose();
  });

  const resetToMonth = () => {
    form.setValue("startDate", defaultStart);
    form.setValue("endDate", defaultEnd);
    form.setValue("fullMonth", true);
    setPreviewMonth(month);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRecord ? "Edit Payroll Record" : "New Payroll Record"}</DialogTitle>
          <p className="text-sm text-slate-300">
            Capture monthly assignment billing, payroll and deductions. Proration is automatic for partial months.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nurse</Label>
              <Select value={values.nurseId} onValueChange={(value) => form.setValue("nurseId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nurse" />
                </SelectTrigger>
                <SelectContent>
                  {nurses.length ? nurses.map((nurse) => (
                    <SelectItem key={nurse.id} value={nurse.id}>
                      {nurse.name}
                    </SelectItem>
                  )) : (
                    <div className="px-3 py-2 text-xs text-slate-400">Add nurses first</div>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.nurseId ? (
                <p className="text-xs text-rose-300">{form.formState.errors.nurseId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={values.clientId} onValueChange={(value) => form.setValue("clientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length ? clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  )) : (
                    <div className="px-3 py-2 text-xs text-slate-400">Add clients first</div>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId ? (
                <p className="text-xs text-rose-300">{form.formState.errors.clientId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Monthly Contract Amount</Label>
              <Input type="number" step="0.01" min="0" {...form.register("contractAmount", { valueAsNumber: true })} />
              {form.formState.errors.contractAmount ? (
                <p className="text-xs text-rose-300">{form.formState.errors.contractAmount.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Monthly Salary</Label>
              <Input type="number" step="0.01" min="0" {...form.register("salary", { valueAsNumber: true })} />
              {form.formState.errors.salary ? (
                <p className="text-xs text-rose-300">{form.formState.errors.salary.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Transportation Allowance</Label>
              <Input type="number" step="0.01" min="0" {...form.register("transportation", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Overtime Days</Label>
              <Input type="number" step="0.1" min="0" {...form.register("overtimeDays", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Fines / Deductions</Label>
              <Input type="number" step="0.01" min="0" {...form.register("fines", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Preview Month</Label>
              <Input
                type="month"
                value={previewMonth}
                onChange={(event) => setPreviewMonth(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Label className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
                Start Date
                <CalendarDays className="h-4 w-4 text-brand-200" />
              </Label>
              <Input type="date" {...form.register("startDate")} />
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Label className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
                End Date
                <CalendarDays className="h-4 w-4 text-brand-200" />
              </Label>
              <Input type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate ? (
                <p className="text-xs text-rose-300">{form.formState.errors.endDate.message}</p>
              ) : null}
            </div>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Full Month</p>
                <Switch
                  checked={values.fullMonth}
                  onCheckedChange={(checked) => form.setValue("fullMonth", checked)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-4 justify-start gap-2 rounded-xl border border-white/10 bg-white/10 text-xs"
                onClick={resetToMonth}
              >
                <RefreshCcw className="h-4 w-4" />
                Reset to full month
              </Button>
            </div>
          </div>

          {previewRecord ? (
            <div className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-5 text-sm text-slate-100 shadow-inner shadow-brand-500/20">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-brand-100">
                <Calculator className="h-4 w-4" /> Financial Preview
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p>
                    <span className="text-slate-300">Billed Income:</span> <strong>{currencyFormatter(previewRecord.billedAmount, currency)}</strong>
                  </p>
                  <p>
                    <span className="text-slate-300">Payable Amount:</span> <strong>{currencyFormatter(previewRecord.payableAmount, currency)}</strong>
                  </p>
                  <p>
                    <span className="text-slate-300">Profit:</span> <strong className={previewRecord.profit >= 0 ? "text-emerald-200" : "text-rose-200"}>{currencyFormatter(previewRecord.profit, currency)}</strong>
                  </p>
                </div>
                <div className="space-y-1 text-xs text-slate-200">
                  <p>Days Worked: {previewRecord.daysWorked} / {previewRecord.totalWorkingDays}</p>
                  <p>Overtime Amount: {currencyFormatter(previewRecord.overtimeAmount, currency)}</p>
                  <p>Transportation: {currencyFormatter(previewRecord.transportationAmount, currency)}</p>
                  <p>Fines/Deductions: {currencyFormatter(previewRecord.fines, currency)}</p>
                </div>
              </div>
            </div>
          ) : (
            <Badge variant="soft" className="w-full justify-center">
              Select nurse and client to preview calculations
            </Badge>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/10">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">
              {editingRecord ? "Save Changes" : "Create Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
