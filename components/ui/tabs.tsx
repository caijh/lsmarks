"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted/70 backdrop-blur-sm p-1 text-muted-foreground border border-border/40 shadow-sm relative overflow-hidden",
      className
    )}
    {...props}
  >
    {/* 主题相关渐变背景 */}
    <span className="absolute inset-0 bg-gradient-primary-subtle opacity-30 -z-10"></span>
    <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -z-10"></span>
    {props.children}
  </TabsPrimitive.List>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
      "data-[state=active]:bg-background/80 data-[state=active]:backdrop-blur-sm data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/20 data-[state=active]:border",
      "hover:bg-background/50 hover:text-foreground/90",
      className
    )}
    {...props}
  >
    {/* 主题相关渐变背景 - 仅在激活状态显示 */}
    <span className="absolute inset-0 bg-gradient-primary-subtle opacity-0 data-[state=active]:opacity-40 transition-opacity -z-10"></span>
    <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity -z-10"></span>
    {props.children}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
