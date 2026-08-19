"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Root> & { onValueChange: (value: string) => void }
>(({ className, onValueChange, ...props }, ref) => (
  <RadixSelect.Root
    ref={ref}
    onValueChange={onValueChange}
    className={cn("relative flex w-full cursor-default appearance-none select-none items-center justify-between rounded-md border bg-background p-1 text-text-foreground", className)}
    {...props}
  >
    <RadixSelect.Trigger className="w-full cursor-pointer">
      <div className="flex flex-col">
        <slot />
      </div>
    </RadixSelect.Trigger>
    <RadixSelect.Portal>
      <RadixSelect.Content className="relative z-50 rounded-md border bg-popover p-1">
        <RadixSelect.Viewport className="p-1">
          <slot />
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
));
Select.displayName = "Select";
export { Select };