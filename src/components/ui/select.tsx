import * as React from "react";

import {
  Check,
} from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <div className="relative w-[var(--radix-select-trigger-width)]">
    <SelectPrimitive.Root
      ref={ref}
      className={cn("flex cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors data-[state=open]:border-b-2 data-[state=open]:rounded-b-md", className)}
      {...props}
    >
      {/* This is where the trigger/label goes */}
      <div className="flex flex-col p-2">
        {children}
      </div>
      
      {/* This is where the arrow lands */}
      <SelectPrimitive.Icon className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50" />
    </SelectPrimitive.Root>
  </div>
));
Select.displayName = SelectPrimitive.Root.displayName;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Root ref={ref} {...props} className={cn("flex cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors data-[state=open]:border-b-2 data-[state=open]:rounded-b-md", className)} />
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.SelectValue ref={ref} className={cn("text-foreground", className)} />
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <div className="relative mt-1 mb-1 flex w-[var(--radix-select-content-width)] items-start justify-center rounded-md border border-input bg-background py-1 shadow-md z-50 overflow-hidden text-se-lg max-h-[80vh] data-popper-focus:ring-1 data-popper-ring-offset-2 backdrop-blur-sm" ref={ref} {...props} />
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, ...props }, ref) => (
  <div className="relative flex cursor-default rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" ref={ref} {...props} />
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <div className="my-[1px] h-[1px] bg-muted" ref={ref} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectViewport = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="flex-1 pointer-events-none select-none">{/* ... */}</div>
));
SelectViewport.displayName = "SelectViewport";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectViewport,
};