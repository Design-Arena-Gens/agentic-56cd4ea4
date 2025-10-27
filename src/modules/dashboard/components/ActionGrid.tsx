import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Settings,
  Share,
  Stethoscope,
  Users,
  UserSquare2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

type ActionKey =
  | "payroll"
  | "nurse"
  | "staff"
  | "client"
  | "invoice"
  | "report"
  | "settings"
  | "export";

const ACTIONS: {
  key: ActionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    key: "payroll",
    label: "New Record",
    icon: FileSpreadsheet,
    description: "Add nurse assignment payroll details",
  },
  {
    key: "nurse",
    label: "Nurses",
    icon: Stethoscope,
    description: "Manage nurse profiles and rates",
  },
  {
    key: "staff",
    label: "Staff",
    icon: Users,
    description: "Manage internal staff salaries",
  },
  {
    key: "client",
    label: "Clients",
    icon: UserSquare2,
    description: "Update client details and TRNs",
  },
  {
    key: "invoice",
    label: "Invoice",
    icon: FileText,
    description: "Generate a branded tax invoice",
  },
  {
    key: "report",
    label: "Report",
    icon: Share,
    description: "Create a monthly finance report",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    description: "Configure company & bank info",
  },
  {
    key: "export",
    label: "Export",
    icon: Download,
    description: "Download CSV payroll data",
  },
];

interface ActionGridProps {
  onAction: (action: ActionKey) => void;
}

export const ActionGrid = ({ onAction }: ActionGridProps) => (
  <section className="grid gap-3 md:grid-cols-4">
    {ACTIONS.map((action, index) => (
      <motion.div
        key={action.key}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.28 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-glass backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
            <action.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{action.label}</p>
            <p className="text-xs text-slate-300">{action.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/10 text-sm font-medium text-white transition group-hover:bg-white/20"
          onClick={() => onAction(action.key)}
        >
          {action.key === "export" ? "Download CSV" : "Open"}
        </Button>
      </motion.div>
    ))}
  </section>
);
