import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  ...props
}: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        "z-50 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-lg",
        className,
      )}
      sideOffset={6}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
