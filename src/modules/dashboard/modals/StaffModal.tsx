import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useData } from "../../../context/DataContext";
import { toast } from "sonner";
import { Trash2, UserCog } from "lucide-react";
import type { StaffMember } from "../../../types";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  designation: z.string().min(2, "Designation is required"),
  monthlySalary: z.coerce.number().min(0, "Salary must be positive"),
});

type StaffFormValues = z.infer<typeof schema>;

interface StaffModalProps {
  open: boolean;
  onClose: () => void;
}

export const StaffModal = ({ open, onClose }: StaffModalProps) => {
  const { staff, upsertStaff, deleteStaff } = useData();
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      designation: "",
      monthlySalary: 0,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        id: editing.id,
        name: editing.name,
        designation: editing.designation,
        monthlySalary: editing.monthlySalary,
      });
    } else {
      form.reset({ name: "", designation: "", monthlySalary: 0 });
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
      staff.filter((member) =>
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.designation.toLowerCase().includes(search.toLowerCase()),
      ),
    [staff, search],
  );

  const onSubmit = form.handleSubmit((values: StaffFormValues) => {
    upsertStaff(values);
    toast.success(editing ? "Staff updated" : "Staff added");
    setEditing(null);
  });

  const handleDelete = (member: StaffMember) => {
    if (!window.confirm(`Remove ${member.name}?`)) return;
    deleteStaff(member.id);
    toast.success("Staff removed");
    if (editing?.id === member.id) setEditing(null);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Staff Management</DialogTitle>
          <p className="text-sm text-slate-300">
            Maintain internal staff salaries. These costs are deducted from gross profit to calculate net profit.
          </p>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[360px_1fr]">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <UserCog className="h-4 w-4" /> {editing ? "Update Staff" : "Add Staff"}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name</Label>
              <Input id="staff-name" placeholder="e.g. David Matthews" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-rose-300">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Designation</Label>
              <Input id="staff-role" placeholder="e.g. Finance Manager" {...form.register("designation")} />
              {form.formState.errors.designation ? (
                <p className="text-xs text-rose-300">{form.formState.errors.designation.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-salary">Monthly Salary</Label>
              <Input
                id="staff-salary"
                type="number"
                min="0"
                step="0.01"
                {...form.register("monthlySalary", { valueAsNumber: true })}
              />
              {form.formState.errors.monthlySalary ? (
                <p className="text-xs text-rose-300">{form.formState.errors.monthlySalary.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full rounded-xl">
              {editing ? "Save Changes" : "Add Staff"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Badge variant="soft">{filtered.length} team</Badge>
            </div>
            <div className="max-h-[52vh] space-y-3 overflow-auto pr-2">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                >
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.designation}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Salary {member.monthlySalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/20 text-xs"
                      onClick={() => setEditing(member)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl border border-transparent text-rose-200 hover:bg-rose-500/15"
                      onClick={() => handleDelete(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!filtered.length ? (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
                  No staff match that search.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
