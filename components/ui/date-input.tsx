"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MaskedDateInput from "@/components/ui/masked-date-input";

interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

/**
 * Função de máscara para data (DD/MM/YYYY)
 * Só aceita números e insere / automaticamente
 * Suporta backspace corretamente
 */
function maskDate(raw: string): string {
  // Remove tudo que não é número
  let digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = "";

  // Formata progressivamente conforme o usuário digita
  if (digits.length >= 1) out = digits.slice(0, 2);
  if (digits.length >= 3) out = digits.slice(0, 2) + "/" + digits.slice(2, 4);
  if (digits.length >= 5)
    out = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);

  return out;
}

/**
 * Valida se uma data é válida
 */
function isValidDate(day: number, month: number, year: number): boolean {
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Permite:
 * - Escrever a data manualmente (DD/MM/YYYY) com máscara automática
 * - Selecionar no calendário
 * - Sincroniza texto com data e mês do calendário
 */
export function DateInputWithCalendar({ value, onChange, placeholder }: DateInputProps) {
  const [maskedValue, setMaskedValue] = useState("__/__/____");
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);

  // Atualiza o valor mascarado quando o valor externo muda
  useEffect(() => {
    if (!value) {
      setMaskedValue("__/__/____");
      setCalendarMonth(undefined);
    } else {
      const formatted = format(value, "dd/MM/yyyy");
      setMaskedValue(formatted);
      setCalendarMonth(value);
    }
  }, [value]);

  const handleMaskedChange = (v: string) => {
    setMaskedValue(v);

    // Se for o placeholder, limpa a data
    if (v === "__/__/____" || !v) {
      onChange(null);
      return;
    }

    // Extrai os dígitos (remove underscores e barras)
    const digits = v.replace(/[^0-9]/g, "");
    
    // Se tiver 8 dígitos (DDMMYYYY completo), tenta validar e converter
    if (digits.length === 8) {
      const day = Number(digits.substring(0, 2));
      const month = Number(digits.substring(2, 4));
      const year = Number(digits.substring(4, 8));

      // Valida a data
      if (isValidDate(day, month, year)) {
        const dt = new Date(year, month - 1, day);
        
        // Verifica se a data é válida (não é NaN)
        if (!isNaN(dt.getTime())) {
          onChange(dt);
          setCalendarMonth(dt); // Sincroniza o mês do calendário
        } else {
          onChange(null);
        }
      } else {
        onChange(null);
      }
    } else {
      // Se não estiver completo, limpa a data mas mantém o texto formatado
      onChange(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <MaskedDateInput
            value={maskedValue}
            onChange={handleMaskedChange}
            placeholder="__/__/____"
            className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 
                       text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 
                       outline-none transition-all"
          />

          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
        </div>
      </PopoverTrigger>

      <PopoverContent 
        className="p-0 shadow-lg border rounded-xl min-w-[320px] w-[320px]" 
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={(date) => {
            onChange(date || null);
            if (date) {
              setCalendarMonth(date);
            }
          }}
          month={calendarMonth}
          onMonthChange={(month) => {
            setCalendarMonth(month);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

