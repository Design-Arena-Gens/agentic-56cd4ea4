import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useData } from "../../../context/DataContext";
import type { CompanySettings } from "../../../types";

const schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyTrn: z.string().optional(),
  currency: z.enum(["AED", "USD", "EUR", "GBP", "SAR"]),
  vatRate: z.coerce.number().min(0).max(100),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  bankCompanyTrn: z.string().optional(),
  contactNote: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof schema>;

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { settings, updateSettings, resetAll } = useData();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      companyName: settings.companyName,
      companyTrn: settings.companyTrn ?? "",
      currency: settings.currency,
      vatRate: settings.vatRate,
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      iban: settings.iban,
      bankCompanyTrn: settings.bankCompanyTrn ?? "",
      contactNote: settings.contactNote,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        companyName: settings.companyName,
        companyTrn: settings.companyTrn ?? "",
        currency: settings.currency,
        vatRate: settings.vatRate,
        bankName: settings.bankName,
        bankAccountNumber: settings.bankAccountNumber,
        iban: settings.iban,
        bankCompanyTrn: settings.bankCompanyTrn ?? "",
        contactNote: settings.contactNote,
      });
    }
  }, [open, settings, form]);

  const onSubmit = form.handleSubmit((values: SettingsFormValues) => {
    updateSettings({
      companyName: values.companyName,
      companyTrn: values.companyTrn || undefined,
      currency: values.currency,
      vatRate: values.vatRate,
      bankName: values.bankName || "",
      bankAccountNumber: values.bankAccountNumber || "",
      iban: values.iban || "",
      bankCompanyTrn: values.bankCompanyTrn || undefined,
      contactNote: values.contactNote || "",
    });
    toast.success("Settings updated");
    onClose();
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, key: "headerImage" | "footerImage") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please upload images below 2MB");
      return;
    }
    try {
      const base64 = await readFileAsBase64(file);
      updateSettings({ [key]: base64 } as Partial<CompanySettings>);
      toast.success(`${key === "headerImage" ? "Header" : "Footer"} image updated`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings & Branding</DialogTitle>
          <p className="text-sm text-slate-300">
            Configure financial defaults, TRN information, bank details and branded invoice assets.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input {...form.register("companyName")} />
              {form.formState.errors.companyName ? (
                <p className="text-xs text-rose-300">{form.formState.errors.companyName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Company TRN</Label>
              <Input placeholder="Optional" {...form.register("companyTrn")} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.watch("currency")} onValueChange={(value) => form.setValue("currency", value as SettingsFormValues["currency"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["AED", "USD", "EUR", "GBP", "SAR"] as const).map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>VAT Rate (%)</Label>
              <Input type="number" step="0.1" min="0" max="100" {...form.register("vatRate", { valueAsNumber: true })} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Bank Details</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input {...form.register("bankName")} />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input {...form.register("bankAccountNumber")} />
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input {...form.register("iban")} />
              </div>
              <div className="space-y-2">
                <Label>Bank TRN (if different)</Label>
                <Input {...form.register("bankCompanyTrn")} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <Label>Brand Header Image (2480x400)</Label>
              <Input type="file" accept="image/*" onChange={(event) => handleUpload(event, "headerImage")} />
              {settings.headerImage ? (
                <img src={settings.headerImage} alt="Header preview" className="mt-3 h-24 w-full rounded-2xl object-cover" />
              ) : (
                <p className="mt-2 text-xs text-slate-400">No header uploaded.</p>
              )}
            </div>
            <div>
              <Label>Brand Footer Image (2480x300)</Label>
              <Input type="file" accept="image/*" onChange={(event) => handleUpload(event, "footerImage")} />
              {settings.footerImage ? (
                <img src={settings.footerImage} alt="Footer preview" className="mt-3 h-20 w-full rounded-2xl object-cover" />
              ) : (
                <p className="mt-2 text-xs text-slate-400">No footer uploaded.</p>
              )}
            </div>
          </section>

          <div className="space-y-2">
            <Label>Contact Note</Label>
            <Textarea rows={3} {...form.register("contactNote")} placeholder="For queries, please contact..." />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" className="rounded-xl border border-white/10 bg-white/10" onClick={() => {
              if (window.confirm("Reset all data and settings? This action cannot be undone.")) {
                resetAll();
                toast.success("All data cleared");
                onClose();
              }
            }}>
              Reset Workspace
            </Button>
            <Button type="submit" className="rounded-xl">
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
