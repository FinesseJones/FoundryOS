"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const radius = 0;

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex-1 transition-all duration-200", className)}
      ref={ref}
      {...props}
    />
  )
);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<HTMLPortal, React.ComponentPropsWithoutRef<HTMLDivElement>>(
  ({ className, sideOffset = "below", ...props }, ref) => (
    <div
      className={cn(
        "z-20 overflow-hidden rounded-md p-1 bg-popover text-popover-foreground shadow-md",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<button, React.ComponentPropsWithoutRef<button>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
SelectItem.displayName = "SelectItem";

export { SelectContent, SelectItem, SelectTrigger, SelectValue };