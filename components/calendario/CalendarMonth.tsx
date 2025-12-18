"use client";

import React, { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DayEventsDialog } from "./DayEventsDialog";

// Bordas consistentes
const calendarMonthStyles = `
  .calendar-month-cell {
    border: 1px solid #e5e7eb !important;
    box-sizing: border-box !important;
  }
`;

interface Marcacao {
  id: number;
  clienteId: number;
  cliente: {
    id: number;
    nomeCompleto: string;
    telemovel: string | null;
    email: string | null;
  };
  data: string;
  hora: string;
  tipo: string;
  preco: number | null;
  observacoes: string | null;
  status: string;
  createdAt: string;
}

interface CalendarMonthProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  marcacoes: Marcacao[];
  onDayClick?: (date: Date) => void;
  onDeleteMarcacao?: (id: number) => void;
}

export function CalendarMonth({
  currentDate,
  onDateChange,
  marcacoes,
  onDayClick,
  onDeleteMarcacao,
}: CalendarMonthProps) {
  const hoje = new Date();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Agrupar marcações por dia
  const marcacoesByDay = useMemo(() => {
    const grouped = new Map<string, Marcacao[]>();
    marcacoes.forEach((marcacao) => {
      const key = format(new Date(marcacao.data), "yyyy-MM-dd");
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(marcacao);
    });
    return grouped;
  }, [marcacoes]);

  // Gerar dias do mês + dias vizinhos necessários para completar semanas
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const selectedDayMarcacoes = selectedDay
    ? marcacoesByDay.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];

  const handleDayClick = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const events = marcacoesByDay.get(key) || [];

    if (events.length > 0) {
      setSelectedDay(day);
      setDialogOpen(true);
    } else if (onDayClick) onDayClick(day);
  };

  return (
    <>
      <style>{calendarMonthStyles}</style>

      <div className="space-y-4 overflow-x-hidden max-w-full w-full">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-text-dark">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={() => onDateChange(subMonths(currentDate, 1))} className="flex-1 md:flex-initial">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button variant="outline" disabled className="flex-1 md:flex-initial">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
              <span className="md:hidden">{format(currentDate, "MMM yyyy", { locale: ptBR })}</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => onDateChange(addMonths(currentDate, 1))} className="flex-1 md:flex-initial">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* CALENDÁRIO */}
        <div className="w-full mx-auto mt-4 overflow-x-hidden max-w-full">
          <div className="flex flex-col md:h-[calc(100vh-335px)] min-h-0 w-full">

            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-7 flex-shrink-0 border border-gray-200 w-full">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs md:text-sm font-medium text-text-light py-2 border-r border-gray-200 last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Corpo do calendário — AGORA 100% FIXO E ALINHADO */}
            <div className="grid grid-cols-7 md:flex-1 md:min-h-0 border border-gray-300 auto-rows-fr w-full">
              {days.map((day, index) => {
                const key = format(day, "yyyy-MM-dd");
                const isCurrent = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, hoje);
                const count = marcacoesByDay.get(key)?.length ?? 0;

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={!isCurrent}
                    className={cn(
                      "calendar-month-cell flex flex-col items-center justify-start py-2 overflow-hidden relative",
                      "hover:bg-accent/20 transition-all duration-150",
                      isCurrent ? "bg-white" : "bg-gray-100 text-gray-400 cursor-not-allowed",
                      isToday && isCurrent && "bg-primary/10 ring-inset ring-2 ring-primary/30"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday && isCurrent && "text-primary",
                        !isCurrent && "text-gray-400"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {count > 0 && isCurrent && (
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DayEventsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDay}
        marcacoes={selectedDayMarcacoes}
        onDelete={onDeleteMarcacao}
      />
    </>
  );
}
