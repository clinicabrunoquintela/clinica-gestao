"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTipoColor } from "./CalendarUtils";

interface Marcacao {
  id: number;
  data: string;
  hora: string;
  tipo: string;
  status: string;
  cliente: {
    id: number;
    nomeCompleto: string;
  };
}

interface CalendarYearWithEventsProps {
  year?: number;
  onYearChange?: (year: number) => void;
  onDayClick?: (date: Date, marcacoes: Marcacao[]) => void;
  marcacoes?: Marcacao[]; // Lista completa de marcações do utente
}

export function CalendarYearWithEvents({ 
  year = new Date().getFullYear(),
  onYearChange,
  onDayClick,
  marcacoes = []
}: CalendarYearWithEventsProps) {
  const [currentYear, setCurrentYear] = useState(year);
  const hoje = new Date();

  // Criar mapa de marcações por dia (YYYY-MM-DD -> primeira Marcacao)
  const marcacoesByDay = useMemo(() => {
    const map = new Map<string, Marcacao>();
    marcacoes.forEach((marcacao) => {
      const dateKey = format(new Date(marcacao.data), "yyyy-MM-dd");
      // Opção A: usar apenas a primeira marcação do dia
      if (!map.has(dateKey)) {
        map.set(dateKey, marcacao);
      }
    });
    return map;
  }, [marcacoes]);

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

  const isHoje = (data: Date) => {
    return format(data, "yyyy-MM-dd") === format(hoje, "yyyy-MM-dd");
  };

  const getMarcacaoDoDia = (data: Date): Marcacao | null => {
    const dateKey = format(data, "yyyy-MM-dd");
    return marcacoesByDay.get(dateKey) || null;
  };

  const handleYearChange = (delta: number) => {
    const newYear = currentYear + delta;
    setCurrentYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  const handleDayClick = (data: Date) => {
    const marcacao = getMarcacaoDoDia(data);
    if (onDayClick) {
      // Passar array com a marcação ou vazio
      onDayClick(data, marcacao ? [marcacao] : []);
    }
  };

  // Função para obter cor de fundo com opacidade
  const getBackgroundColor = (cor: string, opacidade: number = 20): string => {
    // Converter hex para rgba
    const r = parseInt(cor.slice(1, 3), 16);
    const g = parseInt(cor.slice(3, 5), 16);
    const b = parseInt(cor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacidade / 100})`;
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

      {/* Grid de 12 meses */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[1fr]">
          {meses.map(({ mes, nome }) => {
            const dias = getDiasDoMes(mes);
            const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);

            return (
              <div
                key={nome}
                className="rounded-[10px] border border-[#E5E7EB] bg-white p-1 flex flex-col h-full"
                style={{ borderWidth: '1px' }}
              >
                {/* Nome do mês */}
                <h3 className="text-[14px] text-[#111] mb-0.5 px-1 text-center" style={{ fontWeight: 600 }}>
                  {nomeCapitalizado}
                </h3>

                {/* Siglas dos dias da semana */}
                <div className="grid grid-cols-7 place-items-center mb-0.5">
                  {["S", "T", "Q", "Q", "S", "S", "D"].map((sigla, index) => (
                    <div
                      key={index}
                      className="text-[11px] font-semibold text-amber-500 tracking-wide uppercase w-6 text-center"
                    >
                      {sigla}
                    </div>
                  ))}
                </div>

                {/* Grade dos dias */}
                <div className="grid grid-cols-7 gap-0.5 place-items-center flex-1">
                  {dias.map((dia, index) => {
                    const isMesAtual = isSameMonth(dia, mes);
                    const isHojeDia = isHoje(dia);
                    const marcacao = getMarcacaoDoDia(dia);
                    const hasMarcacao = marcacao !== null;

                    if (!isMesAtual) {
                      return (
                        <div
                          key={index}
                          className="w-6 h-6"
                        />
                      );
                    }

                    const dayNumber = format(dia, "d");

                    // Se tem marcação, aplicar estilo de feriado (círculo colorido com borda)
                    if (hasMarcacao) {
                      const corMarcacao = getTipoColor(marcacao.tipo);
                      // Usar opacidade mais alta para melhor visibilidade (25%)
                      const bgColor = getBackgroundColor(corMarcacao, 25);
                      // Cor da borda (mais escura)
                      const borderColor = corMarcacao;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayClick(dia)}
                          className="flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-semibold text-[#444] focus:outline-none transition-transform duration-\[120ms\] ease-in-out hover:scale-[1.12]"
                          style={{ 
                            backgroundColor: bgColor,
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          {dayNumber}
                        </button>
                      );
                    }

                    // Dia de hoje sem marcação
                    if (isHojeDia) {
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayClick(dia)}
                          className="flex items-center justify-center w-6 h-6 rounded-full text-[12px] bg-amber-100 text-amber-500 font-semibold ring-amber-300 hover:bg-amber-200 focus:outline-none transition-transform duration-\[120ms\] ease-in-out hover:scale-[1.12]"
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
                          "flex items-center justify-center w-6 h-6 rounded-full text-[12px] text-[#444] transition-transform duration-\[120ms\] ease-in-out hover:scale-[1.12]",
                          "hover:bg-[#f4f4f4] focus:outline-none"
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
    </div>
  );
}
