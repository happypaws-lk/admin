"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-start rounded-xl bg-black/40 p-1 text-zinc-400 border border-white/[0.08] relative",
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isSelected = context.value === value;
  const restProps = { ...props } as Record<string, unknown>;
  delete restProps.onAnimationStart;
  delete restProps.onDrag;
  delete restProps.onDragStart;
  delete restProps.onDragEnd;

  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={isSelected}
      whileTap={{ scale: 0.96 }}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold select-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "text-zinc-100"
          : "text-zinc-400 hover:text-zinc-200",
        className
      )}
      {...restProps}
    >
      <span className="relative z-10">{children}</span>
      {isSelected && (
        <motion.div
          layoutId="uiActiveTabPill"
          className="absolute inset-0 bg-white/[0.12] border border-white/[0.1] rounded-lg shadow-sm z-0"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;
  const restProps = { ...props } as Record<string, unknown>;
  delete restProps.onAnimationStart;
  delete restProps.onDrag;
  delete restProps.onDragStart;
  delete restProps.onDragEnd;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className={cn(
        "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

