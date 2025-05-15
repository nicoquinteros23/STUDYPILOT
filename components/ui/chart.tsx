"use client"

import * as React from "react"
import { BarChartIcon } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("border bg-background px-3 py-1.5 shadow-sm rounded-lg", className)} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("h-[350px] w-full", className)} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold text-foreground", className)} {...props} />
  ),
)
ChartTitle.displayName = "ChartTitle"

const ChartDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
ChartDescription.displayName = "ChartDescription"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-4", className)} {...props} />
  ),
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    color?: string
  }
>(({ className, color, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
  </div>
))
ChartLegendItem.displayName = "ChartLegendItem"

const ChartEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-[350px] w-full flex-col items-center justify-center gap-2 text-center", className)}
      {...props}
    >
      <BarChartIcon className="h-10 w-10 text-muted-foreground/50" />
      <div className="max-w-[250px] space-y-1">
        <p className="text-lg font-medium">No data</p>
        <p className="text-sm text-muted-foreground">There is no data to display.</p>
      </div>
    </div>
  ),
)
ChartEmpty.displayName = "ChartEmpty"

export {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartDescription,
  ChartEmpty,
  ChartLegend,
  ChartLegendItem,
  ChartTitle,
  ChartTooltip,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
}
