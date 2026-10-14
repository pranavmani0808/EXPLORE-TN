"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id?: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type TabItemOrSeparator = TabItem | { type: "separator" };

interface ExpandableTabsProps {
  tabs: TabItemOrSeparator[];
  className?: string;
  activeColor?: string;
  selected?: number | null;
  onChange?: (index: number | null) => void;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "bg-sky-50 text-sky-700 border-sky-300",
  selected = null,
  onChange,
}: ExpandableTabsProps) {
  const [internalSelected, setInternalSelected] = React.useState<number | null>(selected);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = selected !== undefined ? selected : internalSelected;

  React.useEffect(() => {
    if (selected !== undefined) {
      setInternalSelected(selected);
    }
  }, [selected]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Optional outside click handling
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (index: number) => {
    const next = activeIndex === index ? index : index;
    setInternalSelected(next);
    onChange?.(next);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 p-1 shadow-sm backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab, idx) => {
        if ("type" in tab && tab.type === "separator") {
          return (
            <div
              key={`sep-${idx}`}
              className="h-4 w-px bg-slate-200 mx-1 shrink-0"
              aria-hidden="true"
            />
          );
        }

        const item = tab as TabItem;
        const Icon = item.icon;
        const isSelected = activeIndex === idx;

        return (
          <motion.button
            key={item.id || item.title || idx}
            layout
            type="button"
            onClick={() => handleSelect(idx)}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 border cursor-pointer shrink-0 select-none",
              isSelected
                ? cn("border shadow-xs", activeColor)
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            )}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          >
            <Icon className="size-4 shrink-0" />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap text-xs font-bold"
                >
                  {item.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

export const Skiper96 = ExpandableTabs;
export default ExpandableTabs;
