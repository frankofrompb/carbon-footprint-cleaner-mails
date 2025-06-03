
import * as React from "react"
import { cn } from "@/lib/utils"

const Shell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("container mx-auto px-4 py-8", className)}
    {...props}
  />
))
Shell.displayName = "Shell"

export { Shell }
