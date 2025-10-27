import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Briefcase, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useData } from "../../../context/DataContext";
import type { ClientCompany } from "../../../types";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Client name is required"),
  trn: z.string().max(64).optional(),
});

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
}

type ClientFormValues = z.infer<typeof schema>;

export const ClientModal = ({ open, onClose }: ClientModalProps) => {
  const { clients, upsertClient, deleteClient } = useData();
  const [editing, setEditing] = useState<ClientCompany | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", trn: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ id: editing.id, name: editing.name, trn: editing.trn ?? "" });
    } else {
      form.reset({ name: "", trn: "" });
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
      clients.filter((client) =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        (client.trn ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [clients, search],
  );

  const onSubmit = form.handleSubmit((values) => {
    upsertClient({ ...values, trn: values.trn?.trim() || undefined });
    toast.success(editing ? "Client updated" : "Client added");
    setEditing(null);
  });

  const handleDelete = (client: ClientCompany) => {
    if (!window.confirm(`Remove ${client.name}? This will delete related payroll records.`)) return;
    deleteClient(client.id);
    toast.success("Client removed");
    if (editing?.id === client.id) setEditing(null);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => (!state ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Clients Management</DialogTitle>
          <p className="text-sm text-slate-300">
            Manage client company records including TRN registration numbers for invoicing compliance.
          </p>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[360px_1fr]">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Briefcase className="h-4 w-4" /> {editing ? "Update Client" : "Add Client"}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input id="client-name" placeholder="e.g. Golden Care Medical" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-rose-300">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-trn">Client TRN</Label>
              <Input id="client-trn" placeholder="TRN (optional)" {...form.register("trn")} />
              <p className="text-xs text-slate-400">Displayed beneath the client name on invoices.</p>
            </div>
            <Button type="submit" className="w-full rounded-xl">
              {editing ? "Save Changes" : "Add Client"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Badge variant="soft">{filtered.length} clients</Badge>
            </div>
            <div className="max-h-[52vh] space-y-3 overflow-auto pr-2">
              {filtered.map((client) => (
                <div
                  key={client.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                >
                  <div>
                    <p className="font-semibold text-white">{client.name}</p>
                    {client.trn ? (
                      <p className="text-xs text-slate-400">TRN: {client.trn}</p>
                    ) : (
                      <p className="text-xs text-amber-200">TRN not provided</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Added {new Date(client.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/20 text-xs"
                      onClick={() => setEditing(client)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl border border-transparent text-rose-200 hover:bg-rose-500/15"
                      onClick={() => handleDelete(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!filtered.length ? (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
                  No clients match that search.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
