import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface SwitchProps extends SwitchPrimitive.SwitchProps {}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/10 p-0.5 transition-colors data-[state=checked]:bg-brand-500",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0 rounded-full bg-white shadow-lg transition-transform duration-200 data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = "Switch";
