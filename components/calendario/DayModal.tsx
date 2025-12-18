"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTipoBadgeClass } from "./CalendarUtils";

interface Marcacao {
  id: number;
  data: string;
  hora: string;
  tipo: string;
  status: string;
  preco: number | null;
  observacoes: string | null;
  cliente: {
    id: number;
    nomeCompleto: string;
  };
}

interface DayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  marcacoes: Marcacao[];
  onEdit?: (marcacao: Marcacao) => void;
}

export function DayModal({ open, onOpenChange, date, marcacoes, onEdit }: DayModalProps) {
  const router = useRouter();

  if (!date) return null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "pago cartão": {
        label: "Pago Cartão",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      "pago numerário": {
        label: "Pago Numerário",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      pendente: {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      concluido: {
        label: "Concluído",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      faltou: {
        label: "Faltou",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      confirmado: {
        label: "Confirmado",
        className: "bg-primary text-white border-primary-dark",
      },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium border ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const handleEdit = (marcacao: Marcacao) => {
    if (onEdit) {
      onEdit(marcacao);
    } else {
      router.push(`/marcacoes/${marcacao.id}`);
    }
    onOpenChange(false);
  };

  const handleView = (marcacao: Marcacao) => {
    router.push(`/marcacoes/${marcacao.id}`);
  };

  // Ordenar marcações por hora
  const sortedMarcacoes = [...marcacoes].sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="px-4 py-4 md:px-0 md:py-0">
          <DialogHeader>
            <DialogTitle>
              Marcações em {format(date, "dd/MM/yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
          {sortedMarcacoes.length === 0 ? (
            <p className="text-center text-text-light py-8">Nenhuma marcação neste dia</p>
          ) : (
            sortedMarcacoes.map((marcacao) => {
              const [hours, minutes] = marcacao.hora.split(":");
              const endHour = (parseInt(hours) + 1).toString().padStart(2, "0");
              const endTime = `${endHour}:${minutes}`;

              return (
                <div
                  key={marcacao.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-text-dark">
                          {marcacao.cliente.nomeCompleto}
                        </h4>
                        {getStatusBadge(marcacao.status)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-text-light">
                          <span className="font-medium">Hora:</span> {marcacao.hora} - {endTime}
                        </p>
                        <p className="text-text-light">
                          <span className="font-medium">Tipo:</span>{" "}
                          <span className={`px-2 py-0.5 rounded-md text-xs border ${getTipoBadgeClass(marcacao.tipo)}`}>
                            {marcacao.tipo}
                          </span>
                        </p>
                        {marcacao.preco && (
                          <p className="text-text-light">
                            <span className="font-medium">Preço:</span> {marcacao.preco.toFixed(2)}€
                          </p>
                        )}
                        {marcacao.observacoes && (
                          <p className="text-text-light mt-2">
                            <span className="font-medium">Observações:</span> {marcacao.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(marcacao)}
                        className="flex items-center gap-1 flex-1 md:flex-initial"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(marcacao)}
                        className="flex items-center gap-1 flex-1 md:flex-initial"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

