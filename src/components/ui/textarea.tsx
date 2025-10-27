import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-inner shadow-white/5 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
