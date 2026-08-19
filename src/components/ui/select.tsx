"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

interface SelectProps extends React.ComponentPropsWithoutRef<HTMLSelectElement> {
  value?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, ...props }, ref) => (
    <div className="relative flex items-center">
      <SelectTrigger ref={ref} className={cn("w-full", className)}>
        <SelectValue placeholder="Select a value" />
      </SelectTrigger>
      <SelectContent className="z-50" />
    </div >
  )
)
Select.displayName = "Select"

// Corrected forwardRef signature
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ value }: { value: string }) => (
  <div className="text-muted-foreground">{value}</div >
)

const SelectContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("z-50 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)}>
    {children}
  </div >
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
      {...props}
    />
  )
)
SelectItem.displayName = "SelectItem"

export { SelectTrigger, SelectContent, SelectItem, SelectValue }