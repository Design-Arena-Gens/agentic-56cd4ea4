import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../../context/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import type { Nurse } from "../../../types";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  defaultSalary: z.coerce.number().min(0, "Salary must be positive"),
  defaultTransportation: z.coerce.number().min(0, "Transportation must be positive"),
});

interface NurseModalProps {
  open: boolean;
  onClose: () => void;
}

type NurseFormValues = z.infer<typeof schema>;

export const NurseModal = ({ open, onClose }: NurseModalProps) => {
  const { nurses, upsertNurse, deleteNurse } = useData();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Nurse | null>(null);

  const form = useForm<NurseFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      defaultSalary: 0,
      defaultTransportation: 0,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        id: editing.id,
        name: editing.name,
        defaultSalary: editing.defaultSalary,
        defaultTransportation: editing.defaultTransportation,
      });
    } else {
      form.reset({ name: "", defaultSalary: 0, defaultTransportation: 0 });
    }
  }, [editing, form, open]);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setSearch("");
    }
  }, [open]);

  const filtered = useMemo(
    () =>
      nurses.filter((nurse) =>
        nurse.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [nurses, search],
  );

  const onSubmit = form.handleSubmit((values: NurseFormValues) => {
    upsertNurse(values);
    toast.success(editing ? "Nurse updated" : "Nurse added");
    setEditing(null);
    form.reset({ name: "", defaultSalary: 0, defaultTransportation: 0 });
  });

  const handleDelete = (nurse: Nurse) => {
    const confirmed = window.confirm(`Remove ${nurse.name}? This will delete their payroll records.`);
    if (!confirmed) return;
    deleteNurse(nurse.id);
    toast.success("Nurse removed");
    if (editing?.id === nurse.id) {
      setEditing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Nurses Management</DialogTitle>
          <p className="text-sm text-slate-300">
            Add, update, and remove nurse profiles. Default values flow into new payroll records automatically.
          </p>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[360px_1fr] md:items-start">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <UserPlus className="h-4 w-4" /> {editing ? "Update Nurse" : "Add Nurse"}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="nurse-name">Name</Label>
              <Input id="nurse-name" placeholder="e.g. Sarah Johnson" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-rose-300">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nurse-salary">Default Monthly Salary</Label>
              <Input id="nurse-salary" type="number" min="0" step="0.01" {...form.register("defaultSalary", { valueAsNumber: true })} />
              {form.formState.errors.defaultSalary ? (
                <p className="text-xs text-rose-300">{form.formState.errors.defaultSalary.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nurse-transport">Transportation Allowance</Label>
              <Input id="nurse-transport" type="number" min="0" step="0.01" {...form.register("defaultTransportation", { valueAsNumber: true })} />
              {form.formState.errors.defaultTransportation ? (
                <p className="text-xs text-rose-300">{form.formState.errors.defaultTransportation.message}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button type="submit" className="w-full rounded-xl">
                {editing ? "Save Changes" : "Add Nurse"}
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Search nurses..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Badge variant="soft" className="whitespace-nowrap">
                {filtered.length} total
              </Badge>
            </div>
            <div className="max-h-[52vh] space-y-3 overflow-auto pr-2">
              {filtered.map((nurse) => (
                <div
                  key={nurse.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                >
                  <div>
                    <p className="font-semibold text-white">{nurse.name}</p>
                    <p className="text-xs text-slate-400">
                      Salary {nurse.defaultSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })} · Transport {nurse.defaultTransportation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Added {new Date(nurse.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/20 text-xs"
                      onClick={() => setEditing(nurse)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl border border-transparent text-rose-200 hover:bg-rose-500/15"
                      onClick={() => handleDelete(nurse)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!filtered.length ? (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
                  No nurses match that search.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
