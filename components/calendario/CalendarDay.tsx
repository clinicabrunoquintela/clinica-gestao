"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
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

interface Event {
  resource: Marcacao;
}

interface CalendarDayProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  marcacoes: Marcacao[];
  onSelectEvent?: (event: Event) => void;
}

export function CalendarDay({
  currentDate,
  onDateChange,
  marcacoes,
  onSelectEvent,
}: CalendarDayProps) {
  const router = useRouter();

  const handlePrevDay = () => {
    onDateChange(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleNewMarcacao = () => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    router.push(`/calendario/dia?data=${dateKey}`);
  };

  const handleEdit = (marcacao: Marcacao) => {
    if (onSelectEvent) {
      onSelectEvent({ resource: marcacao });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: string }> = {
      "pago cartão": {
        label: "Pago Cartão",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "",
      },
      "pago numerário": {
        label: "Pago Numerário",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "",
      },
      pendente: {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "",
      },
      concluido: {
        label: "Concluído",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "✔️",
      },
      faltou: {
        label: "Faltou",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: "❌",
      },
      confirmado: {
        label: "Confirmado",
        className: "bg-primary text-white border-primary-dark",
        icon: "",
      },
    };

    const statusInfo = statusMap[status.toLowerCase()] || statusMap.pendente;

    return (
      <span
        className={cn(
          "text-xs font-medium px-3 py-1 rounded-full border",
          statusInfo.className
        )}
      >
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  // Sort appointments chronologically by hour
  const sortedMarcacoes = [...marcacoes].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full w-full">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Marcações do Dia</h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">
            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Button variant="outline" size="icon" onClick={handlePrevDay} className="flex-1 md:flex-initial">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleToday} className="flex-1 md:flex-initial">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextDay} className="flex-1 md:flex-initial">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button onClick={handleNewMarcacao} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Marcação
          </Button>
        </div>
      </div>

      {/* List of Appointments */}
      {sortedMarcacoes.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-text-light">Nenhuma marcação para este dia.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMarcacoes.map((marcacao) => {
            const [hours, minutes] = marcacao.hora.split(":");
            const endHour = (parseInt(hours) + 1).toString().padStart(2, "0");
            const endTime = `${endHour}:${minutes}`;

            return (
              <div
                key={marcacao.id}
                className="bg-white border border-gray-200 rounded-lg p-4 md:p-4 shadow-sm flex flex-col gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-dark text-base md:text-base mb-2">{marcacao.cliente.nomeCompleto}</p>
                  <p className="text-sm md:text-sm text-gray-600 mb-3">
                    {marcacao.hora} - {endTime} · {marcacao.tipo}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-shrink-0">
                    {getStatusBadge(marcacao.status)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(marcacao)}
                    className="w-full md:w-auto"
                  >
                    Editar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
