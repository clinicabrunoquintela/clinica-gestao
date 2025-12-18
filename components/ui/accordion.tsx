"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  type: "single" | "multiple";
  collapsible: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const ItemContext = React.createContext<{ value: string } | null>(null);

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
}

const Accordion = ({ type = "single", defaultValue, value, onValueChange, children, className, collapsible = false }: AccordionProps) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue || (type === "multiple" ? [] : "")
  );
  const controlledValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <AccordionContext.Provider value={{ value: controlledValue, onValueChange: handleValueChange, type, collapsible }}>
      <div className={cn("space-y-1", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionItem = ({ value, children, className }: AccordionItemProps) => {
  return (
    <ItemContext.Provider value={{ value }}>
      <div className={cn("border-b border-border", className)} data-value={value}>
        {children}
      </div>
    </ItemContext.Provider>
  );
};

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionTrigger = ({ children, className }: AccordionTriggerProps) => {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be inside Accordion");

  const item = React.useContext(ItemContext);
  if (!item) throw new Error("AccordionTrigger must be inside AccordionItem");

  const isOpen = context.type === "single"
    ? context.value === item.value
    : Array.isArray(context.value) && context.value.includes(item.value);

  const handleClick = () => {
    if (context.type === "single") {
      context.onValueChange(isOpen && context.collapsible ? "" : item.value);
    } else {
      const current = Array.isArray(context.value) ? context.value : [];
      const newValue = isOpen
        ? current.filter((v) => v !== item.value)
        : [...current, item.value];
      context.onValueChange(newValue);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContent = ({ children, className }: AccordionContentProps) => {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be inside Accordion");

  const item = React.useContext(ItemContext);
  if (!item) throw new Error("AccordionContent must be inside AccordionItem");

  const isOpen = context.type === "single"
    ? context.value === item.value
    : Array.isArray(context.value) && context.value.includes(item.value);

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        className
      )}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
