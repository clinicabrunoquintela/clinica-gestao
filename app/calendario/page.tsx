"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarMonth } from "@/components/calendario/CalendarMonth";
import { CalendarYear } from "@/components/calendario/CalendarYear";
import { CalendarWeek } from "@/components/calendario/CalendarWeek";
import { CalendarDay } from "@/components/calendario/CalendarDay";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Event } from "react-big-calendar";

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

type ViewType = "annual" | "month" | "week" | "day";

export default function CalendarioPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("annual");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar marcações
  const fetchMarcacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/marcacoes");
      if (response.ok) {
        const data = await response.json();
        setMarcacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar marcações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcacoes();
  }, []);

  // Criar Set com dias que têm marcações (formato 'YYYY-MM-DD')
  const appointmentsByDay = useMemo(() => {
    const daysSet = new Set<string>();
    marcacoes.forEach((marcacao) => {
      const dateKey = format(new Date(marcacao.data), "yyyy-MM-dd");
      daysSet.add(dateKey);
    });
    return daysSet;
  }, [marcacoes]);

  // Handler para clique no dia (vista anual)
  const handleDayClick = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    router.push(`/calendario/dia?data=${dateKey}`);
  };

  // Handler para deletar marcação
  const handleDeleteMarcacao = async (id: number) => {
    try {
      const response = await fetch(`/api/marcacoes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMarcacoes();
        router.refresh();
      } else {
        console.error("Erro ao deletar marcação");
      }
    } catch (error) {
      console.error("Erro ao deletar marcação:", error);
    }
  };

  // Handler para selecionar evento (vistas semana/dia)
  const handleSelectEvent = (event: Event) => {
    const marcacao = event.resource as Marcacao;
    router.push(`/marcacoes/${marcacao.id}`);
  };

  // Filtrar marcações para a data atual (vista mensal)
  const marcacoesForMonth = useMemo(() => {
    return marcacoes.filter((marcacao) => {
      const marcacaoDate = new Date(marcacao.data);
      return (
        marcacaoDate.getMonth() === currentDate.getMonth() &&
        marcacaoDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [marcacoes, currentDate]);

  // Filtrar marcações para a semana atual (vista semanal)
  const marcacoesForWeek = useMemo(() => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return marcacoes.filter((marcacao) => {
      const marcacaoDate = new Date(marcacao.data);
      return marcacaoDate >= weekStart && marcacaoDate <= weekEnd;
    });
  }, [marcacoes, currentDate]);

  // Filtrar marcações para o dia atual (vista diária)
  const marcacoesForDay = useMemo(() => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    return marcacoes.filter((marcacao) => {
      const marcacaoDate = new Date(marcacao.data);
      return marcacaoDate >= dayStart && marcacaoDate <= dayEnd;
    });
  }, [marcacoes, currentDate]);

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full w-full">
      {/* Cabeçalho com título e menu de navegação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Calendário</h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Visualize todas as marcações</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Button
            variant={view === "annual" ? "default" : "outline"}
            onClick={() => setView("annual")}
            className="flex-1 md:flex-initial text-sm md:text-base"
          >
            Anual
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            className="flex-1 md:flex-initial text-sm md:text-base"
          >
            Mês
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            className="flex-1 md:flex-initial text-sm md:text-base"
          >
            Semana
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
            className="flex-1 md:flex-initial text-sm md:text-base"
          >
            Dia
          </Button>
        </div>
      </div>

      {/* Conteúdo baseado na vista selecionada */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-text-light">A carregar marcações...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {view === "annual" && (
            <CalendarYear
              year={currentYear}
              onYearChange={setCurrentYear}
              onDayClick={handleDayClick}
              appointmentsByDay={appointmentsByDay}
            />
          )}

          {view === "month" && (
            <Card>
              <CardContent className="pt-6">
                <CalendarMonth
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  marcacoes={marcacoesForMonth}
                  onDayClick={handleDayClick}
                  onDeleteMarcacao={handleDeleteMarcacao}
                />
              </CardContent>
            </Card>
          )}

          {view === "week" && (
            <Card>
              <CardContent className="pt-6">
                <CalendarWeek
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  marcacoes={marcacoesForWeek}
                  onSelectEvent={handleSelectEvent}
                />
              </CardContent>
            </Card>
          )}

          {view === "day" && (
            <Card>
              <CardContent className="pt-6">
                <CalendarDay
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  marcacoes={marcacoesForDay}
                  onSelectEvent={handleSelectEvent}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
