import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const ScrollArea = ScrollAreaPrimitive.Root;
export const ScrollViewport = ScrollAreaPrimitive.Viewport;

export const Scrollbar = forwardRef<
  HTMLDivElement,
  ScrollAreaPrimitive.ScrollAreaScrollbarProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none rounded-full bg-white/5 p-0.5 transition-colors hover:bg-white/10",
      orientation === "vertical" ? "h-full w-2.5" : "h-2.5 w-full",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-brand-400/80" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
Scrollbar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export const ScrollCorner = ScrollAreaPrimitive.ScrollAreaCorner;
