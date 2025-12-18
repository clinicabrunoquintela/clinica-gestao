"use client";

import React from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface CalendarWeekProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  marcacoes: Marcacao[];
  onSelectEvent?: (event: { resource: Marcacao }) => void;
}

// Feriados estáticos (exemplo - pode ser expandido)
const feriados = [
  "2025-12-25", // Natal
  "2026-01-01", // Ano Novo
  "2026-04-25", // 25 de Abril
  "2026-05-01", // Dia do Trabalhador
  "2026-06-10", // Dia de Portugal
  "2026-08-15", // Assunção
  "2026-10-05", // Implantação da República
  "2026-11-01", // Todos os Santos
  "2026-12-01", // Restauração
  "2026-12-08", // Imaculada Conceição
];

// Gerar horas de 09:00 a 21:00
const horas = Array.from({ length: 13 }, (_, i) => {
  const hour = 9 + i;
  return `${hour.toString().padStart(2, "0")}:00`;
});

// Função para obter cor do status
const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower === "pendente") {
    return "bg-yellow-500";
  } else if (statusLower === "concluido") {
    return "bg-green-500";
  } else if (statusLower === "faltou") {
    return "bg-red-500";
  }
  return "bg-primary"; // Laranja padrão
};

export function CalendarWeek({
  currentDate,
  onDateChange,
  marcacoes,
  onSelectEvent,
}: CalendarWeekProps) {
  const router = useRouter();

  // Obter início da semana (Segunda-feira)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Dias da semana (Segunda a Sábado)
  const diasSemana = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  // Fim da semana (Sábado)
  const weekEnd = addDays(weekStart, 5);

  // Verificar se um dia é feriado
  const isFeriado = (date: Date): boolean => {
    const dateKey = format(date, "yyyy-MM-dd");
    return feriados.includes(dateKey);
  };

  // Filtrar marcações por dia e hora
  const getMarcacoesPorDiaHora = (day: Date, hora: string) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const horaNum = parseInt(hora.substring(0, 2));
    
    return marcacoes.filter((m) => {
      const marcacaoDate = format(new Date(m.data), "yyyy-MM-dd");
      if (marcacaoDate !== dayKey) return false;
      
      const [marcacaoHora] = m.hora.split(":");
      const marcacaoHoraNum = parseInt(marcacaoHora);
      
      // Marcação está nesta hora (ex: 14:30 está na linha 14:00)
      return marcacaoHoraNum === horaNum;
    });
  };

  // Navegação
  const handlePrevWeek = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Handler para clique na marcação
  const handleMarcacaoClick = (marcacao: Marcacao) => {
    if (onSelectEvent) {
      onSelectEvent({ resource: marcacao });
    } else {
      router.push(`/marcacoes/${marcacao.id}`);
    }
  };

  // Agrupar marcações por dia para mobile
  const marcacoesByDay = React.useMemo(() => {
    const grouped = new Map<string, Marcacao[]>();
    marcacoes.forEach((marcacao) => {
      const dayKey = format(new Date(marcacao.data), "yyyy-MM-dd");
      if (!grouped.has(dayKey)) grouped.set(dayKey, []);
      grouped.get(dayKey)!.push(marcacao);
    });
    return grouped;
  }, [marcacoes]);

  // Ordenar marcações por hora
  const sortMarcacoesByHora = (marcs: Marcacao[]) => {
    return [...marcs].sort((a, b) => a.hora.localeCompare(b.hora));
  };

  return (
    <div className="w-full flex flex-col min-h-[500px] md:h-[calc(100vh-280px)] overflow-x-hidden max-w-full w-full">
      {/* Header de navegação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 py-2 gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} className="flex-1 md:flex-initial">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleToday} className="flex-1 md:flex-initial">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} className="flex-1 md:flex-initial">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-text-dark text-center md:text-left">
          Semana de {format(weekStart, "d", { locale: ptBR })} a {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
      </div>

      {/* Versão Mobile - Lista vertical por dia */}
      <div className="block md:hidden space-y-4">
        {diasSemana.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const marcacoesDia = sortMarcacoesByHora(marcacoesByDay.get(dayKey) || []);
          const isFeriadoDay = isFeriado(day);

          return (
            <div key={dayKey} className="border border-gray-200 rounded-lg p-4">
              <div className={cn(
                "mb-3 pb-2 border-b",
                isFeriadoDay && "text-red-600 font-semibold"
              )}>
                <div className="text-sm font-medium text-text-light capitalize">
                  {format(day, "EEEE", { locale: ptBR })}
                </div>
                <div className="text-lg font-semibold text-text-dark">
                  {format(day, "d 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
              
              {marcacoesDia.length === 0 ? (
                <p className="text-sm text-text-light">Sem marcações</p>
              ) : (
                <div className="space-y-2">
                  {marcacoesDia.map((marcacao) => (
                    <div
                      key={marcacao.id}
                      onClick={() => handleMarcacaoClick(marcacao)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity",
                        getStatusColor(marcacao.status)
                      )}
                    >
                      <div className="font-medium">{marcacao.hora}</div>
                      <div className="text-xs opacity-90">{marcacao.cliente.nomeCompleto}</div>
                      <div className="text-xs opacity-75">{marcacao.tipo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Versão Desktop - Grid semanal original */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden border border-gray-200">

        {/* Cabeçalho */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {/* Cabeçalho - Coluna Hora */}
          <div 
            className="flex items-center justify-center border-r border-gray-200 bg-gray-50 h-[50px] text-sm font-medium text-text-dark"
            style={{ width: "90px", flexShrink: 0 }}
          >
            Hora
          </div>

          {/* Cabeçalhos dos dias */}
          {diasSemana.map((day) => {
            const isFeriadoDay = isFeriado(day);
            const nomeDia = format(day, "EEE", { locale: ptBR });
            const dataFormatada = format(day, "dd/MM/yyyy", { locale: ptBR });

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex items-center justify-center border-r border-gray-200 last:border-r-0 h-[50px] text-center flex-1",
                  isFeriadoDay && "bg-red-100 text-red-600 font-semibold"
                )}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="text-sm font-medium capitalize">{nomeDia}</div>
                  <div className="text-xs">{dataFormatada}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corpo do calendário - Flex container para dividir espaço verticalmente */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {horas.map((hora) => (
            <div key={hora} className="flex h-[50px] border-b border-gray-200 last:border-b-0">
              {/* Coluna 0 - Horas */}
              <div 
                className="border-r border-gray-200 text-sm flex items-center justify-center bg-gray-50 text-text-light"
                style={{ width: "90px", flexShrink: 0 }}
              >
                {hora}
              </div>

              {/* Colunas 1-6 - Dias */}
              {diasSemana.map((day) => {
                const marcacoesDiaHora = getMarcacoesPorDiaHora(day, hora);

                return (
                  <div
                    key={`${day.toISOString()}-${hora}`}
                    className="border-r border-gray-200 last:border-r-0 relative flex-1 overflow-hidden p-1 flex flex-col gap-[2px]"
                  >
                    {marcacoesDiaHora.map((marcacao) => (
                      <div
                        key={marcacao.id}
                        onClick={() => handleMarcacaoClick(marcacao)}
                        className={cn(
                          "rounded px-2 py-[2px] text-white text-xs cursor-pointer hover:opacity-90 transition-opacity flex items-center flex-shrink-0",
                          getStatusColor(marcacao.status)
                        )}
                      >
                        {marcacao.hora} - {marcacao.cliente.nomeCompleto}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
