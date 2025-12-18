"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarioAnualProps {
  year?: number;
  onYearChange?: (year: number) => void;
  onDayClick?: (date: Date) => void;
  appointmentsByDay?: Set<string>; // formato 'YYYY-MM-DD'
}

// Feriados fixos de Portugal (formato: "MM-DD")
const HOLIDAYS_FIXOS = [
  "01-01", // Ano Novo
  "04-25", // 25 de Abril
  "05-01", // Dia do Trabalhador
  "06-10", // Dia de Portugal
  "08-15", // Assunção de Nossa Senhora
  "10-05", // Implantação da República
  "11-01", // Todos os Santos
  "12-01", // Restauração da Independência
  "12-08", // Imaculada Conceição
  "12-25", // Natal
];

// Função para calcular a Páscoa (algoritmo de Meeus/Jones/Butcher)
function calcularPascoa(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Função para obter todos os feriados do ano
function getFeriados(year: number): Set<string> {
  const feriados = new Set<string>();
  
  // Feriados fixos
  HOLIDAYS_FIXOS.forEach((holiday) => {
    const [month, day] = holiday.split("-").map(Number);
    const data = new Date(year, month - 1, day);
    feriados.add(format(data, "yyyy-MM-dd"));
  });
  
  // Feriados móveis (baseados na Páscoa)
  const pascoa = calcularPascoa(year);
  const sextaSanta = addDays(pascoa, -2);
  const corpoDeus = addDays(pascoa, 60);
  
  feriados.add(format(sextaSanta, "yyyy-MM-dd"));
  feriados.add(format(corpoDeus, "yyyy-MM-dd"));
  
  return feriados;
}

export function CalendarioAnual({ 
  year = new Date().getFullYear(),
  onYearChange,
  onDayClick,
  appointmentsByDay = new Set()
}: CalendarioAnualProps) {
  const [currentYear, setCurrentYear] = useState(year);
  const hoje = new Date();
  const feriados = useMemo(() => getFeriados(currentYear), [currentYear]);

  // Sincronizar estado local com prop year quando mudar
  useEffect(() => {
    if (year !== currentYear) {
      setCurrentYear(year);
    }
  }, [year]);

  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes = new Date(currentYear, i, 1);
    return {
      mes,
      nome: format(mes, "MMMM", { locale: ptBR }),
    };
  });

  const getDiasDoMes = (mes: Date) => {
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);
    const inicioSemana = startOfWeek(inicioMes, { weekStartsOn: 1 }); // Segunda-feira
    const fimSemana = endOfWeek(fimMes, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: inicioSemana, end: fimSemana });
  };

  const isFeriado = (data: Date) => {
    return feriados.has(format(data, "yyyy-MM-dd"));
  };

  const isHoje = (data: Date) => {
    return format(data, "yyyy-MM-dd") === format(hoje, "yyyy-MM-dd");
  };

  const isBooked = (data: Date) => {
    return appointmentsByDay.has(format(data, "yyyy-MM-dd"));
  };

  const handleYearChange = (delta: number) => {
    const newYear = currentYear + delta;
    setCurrentYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  const handleDayClick = (data: Date) => {
    if (onDayClick) {
      onDayClick(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho com navegação de ano */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-lg font-semibold text-neutral-900">
          {currentYear}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleYearChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleYearChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de 12 meses: responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {meses.map(({ mes, nome }) => {
          const dias = getDiasDoMes(mes);
          const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);

          return (
            <div
              key={nome}
              className="rounded-xl border border-neutral-200 bg-white shadow-sm p-2 flex flex-col gap-1"
            >
              {/* Nome do mês */}
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                {nomeCapitalizado}
              </h3>

              {/* Siglas dos dias da semana */}
              <div className="grid grid-cols-7 place-items-center mb-0.5">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((sigla, index) => (
                  <div
                    key={index}
                    className="text-[11px] font-medium text-neutral-500 w-8 text-center"
                  >
                    {sigla}
                  </div>
                ))}
              </div>

              {/* Grade dos dias */}
              <div className="grid grid-cols-7 gap-1 place-items-center">
                {dias.map((dia, index) => {
                  const diaFormatado = format(dia, "yyyy-MM-dd");
                  const isMesAtual = isSameMonth(dia, mes);
                  const isFeriadoDia = isFeriado(dia);
                  const isHojeDia = isHoje(dia);
                  const isBookedDia = isBooked(dia);

                  if (!isMesAtual) {
                    return (
                      <div
                        key={index}
                        className="w-8 h-8"
                      />
                    );
                  }

                  const dayNumber = format(dia, "d");

                  // Prioridade visual: feriado > marcação > normal
                  if (isFeriadoDia) {
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayClick(dia)}
                        className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FEE2E2] text-neutral-900 text-[15px] hover:bg-[#FECACA] focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                      >
                        {dayNumber}
                      </button>
                    );
                  }

                  if (isBookedDia) {
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayClick(dia)}
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-md bg-neutral-300 text-neutral-800 text-[15px] hover:bg-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-colors",
                          isHojeDia && "ring-2 ring-[#F97316]"
                        )}
                      >
                        {dayNumber}
                      </button>
                    );
                  }

                  // Dia normal
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayClick(dia)}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-md text-[15px] transition-colors",
                        "hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300",
                        isHojeDia && "bg-[#F97316] text-white font-semibold hover:bg-[#EA6820]",
                        !isHojeDia && "text-neutral-700"
                      )}
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
