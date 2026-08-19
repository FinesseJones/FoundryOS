"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement进Props> >(({ className, variant, size, asChild, ...props }, ref) => {
  const CompositeButton = React.createElement(asChild ? Slot : "button", {
    className: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    style: {
        backgroundColor: "var(--background)",
        // Simplified classes for demonstration
    },
    ref,
    {...props}
  } as any);

  return (
    <CompositeButton className={cn(
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        `data-[state=open]:bg-blue-100`,
        `${variant === "primary" ? "bg-blue-600 hover:bg-blue-700 text-white" : variant === "secondary" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-transparent hover:bg-gray-100 text-gray-700"}`,
        `${size === "sm" && "px-3 py-1 text-sm"}`
    )}
   >
        {/* Content passed via children */}
    </CompositeButton>
  );
});
Button.displayName = "Button";
export { Button };