"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    controlledMonth || props.defaultMonth || new Date()
  );

  const month = controlledMonth || internalMonth;

  React.useEffect(() => {
    if (controlledMonth) {
      setInternalMonth(controlledMonth);
    }
  }, [controlledMonth]);

  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  return (
    <DayPicker
      month={month}
      onMonthChange={handleMonthChange}
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-lg border bg-background shadow-sm p-2.5",
        className
      )}
      locale={ptBR}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-3 sm:space-x-3 sm:space-y-0",
        month: "space-y-2.5",
        caption: "flex justify-center pt-0.5 pb-2 relative items-center",
        caption_label: "hidden",

        table: "w-full border-collapse space-y-0.5",
        head_row: "flex mb-1",
        head_cell:
          "text-text-light rounded-md w-8 h-8 font-medium text-[0.75rem] flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: cn(
          "h-8 w-8 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md"
        ),

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-medium text-sm transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "aria-selected:opacity-100"
        ),
        day_selected: cn(
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "rounded-full shadow-md",
          "font-semibold"
        ),
        day_today: "bg-accent/80 text-accent-foreground font-medium",
        day_outside:
          "day-outside text-text-light opacity-50 aria-selected:bg-accent/50 aria-selected:text-text-light aria-selected:opacity-30",
        day_disabled: "text-text-light opacity-40 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        Caption: ({ displayMonth }) => {
          const MIN_YEAR = 1900;
          const MAX_YEAR = 2050;

          return (
            <div className="flex items-center justify-between w-full px-2 py-1">
              {/* Previous year */}
              <button
                type="button"
                onClick={() => handleMonthChange(subMonths(displayMonth, 12))}
                className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Ano anterior"
              >
                «
              </button>

              {/* Previous month */}
              <button
                type="button"
                onClick={() => handleMonthChange(subMonths(displayMonth, 1))}
                className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Mês anterior"
              >
                ‹
              </button>

              {/* Month + Year centered */}
              <div className="flex flex-col items-center flex-1 text-center select-none">
                {/* Month name — Agora totalmente visível */}
                <span className="text-base font-semibold text-gray-900 leading-none capitalize">
                  {format(displayMonth, "MMMM", { locale: ptBR })}
                </span>

                {/* Compact year select */}
                <select
                  value={displayMonth.getFullYear()}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    handleMonthChange(new Date(y, displayMonth.getMonth(), 1));
                  }}
                  className="mt-1 text-[12px] px-2 py-[2px] bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  style={{
                    maxWidth: "70px",
                    appearance: "none",
                  }}
                >
                  {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }).map((_, i) => {
                    const year = MIN_YEAR + i;
                    return (
                      <option
                        key={year}
                        value={year}
                        style={{ fontSize: "12px", padding: "4px" }}
                      >
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Next month */}
              <button
                type="button"
                onClick={() => handleMonthChange(addMonths(displayMonth, 1))}
                className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Próximo mês"
              >
                ›
              </button>

              {/* Next year */}
              <button
                type="button"
                onClick={() => handleMonthChange(addMonths(displayMonth, 12))}
                className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Próximo ano"
              >
                »
              </button>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
