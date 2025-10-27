import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white shadow-inner shadow-white/5 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
