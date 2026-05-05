"use client";

import { forwardRef, ComponentPropsWithoutRef } from "react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type Props = ComponentPropsWithoutRef<typeof Input>;

export const SoftInput = forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      className={cn(
        "h-14 rounded-2xl border-0 bg-primary/10 px-4 text-base font-medium shadow-none transition-all duration-200",
        "placeholder:font-normal placeholder:text-muted-foreground/70",
        "focus-visible:bg-primary/[0.07] focus-visible:ring-2 focus-visible:ring-primary/40",
        "md:text-base",
        className,
      )}
      {...props}
    />
  ),
);

SoftInput.displayName = "SoftInput";
