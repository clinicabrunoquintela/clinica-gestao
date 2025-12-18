"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar as CalendarIcon, FileText, ExternalLink, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  marcacoes: Marcacao[];
  onDelete?: (id: number) => void;
}

export function DayEventsDialog({
  open,
  onOpenChange,
  date,
  marcacoes,
  onDelete,
}: DayEventsDialogProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marcacaoToDelete, setMarcacaoToDelete] = useState<number | null>(null);

  // Ordenar marcações por hora
  const sortedMarcacoes = [...marcacoes].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  const handleViewMarcacao = (id: number) => {
    router.push(`/marcacoes/${id}`);
  };

  const handleEditMarcacao = (id: number) => {
    router.push(`/marcacoes/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setMarcacaoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (marcacaoToDelete && onDelete) {
      await onDelete(marcacaoToDelete);
      setDeleteDialogOpen(false);
      setMarcacaoToDelete(null);
    }
  };

  const handleCreateMarcacao = () => {
    if (date) {
      const dateKey = format(date, "yyyy-MM-dd");
      router.push(`/calendario/dia?data=${dateKey}`);
      onOpenChange(false);
    }
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto w-[calc(100vw-2rem)] md:w-auto max-w-[calc(100vw-2rem)] md:max-w-2xl">
        <div className="px-4 py-4 md:px-0 md:py-0 overflow-x-hidden max-w-full w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">
              Marcações do Dia
            </DialogTitle>
            <DialogDescription>
              {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

        {sortedMarcacoes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-text-light">Nenhuma marcação para este dia</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {sortedMarcacoes.map((marcacao) => (
              <div
                key={marcacao.id}
                className="p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="font-semibold text-text-dark text-base">
                        {marcacao.cliente.nomeCompleto}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-light">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{marcacao.hora}</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{marcacao.tipo}</span>
                      </div>
                      {marcacao.preco && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span>€{marcacao.preco.toFixed(2)}</span>
                        </>
                      )}
                    </div>

                    {marcacao.observacoes && (
                      <div className="flex items-start gap-2 text-sm text-text-light">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="flex-1 break-words">{marcacao.observacoes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-3 py-1 rounded-full font-medium border",
                          marcacao.status.toLowerCase() === "pendente" &&
                            "bg-yellow-100 text-yellow-800 border-yellow-200",
                          marcacao.status.toLowerCase() === "concluido" &&
                            "bg-green-100 text-green-800 border-green-200",
                          marcacao.status.toLowerCase() === "faltou" &&
                            "bg-red-100 text-red-800 border-red-200",
                          marcacao.status.toLowerCase() === "confirmado" &&
                            "bg-primary text-white border-primary-dark",
                          marcacao.status.toLowerCase() === "pago cartão" &&
                            "bg-green-100 text-green-800 border-green-200",
                          marcacao.status.toLowerCase() === "pago numerário" &&
                            "bg-blue-100 text-blue-800 border-blue-200",
                          !["pendente", "concluido", "faltou", "confirmado", "pago cartão", "pago numerário"].includes(
                            marcacao.status.toLowerCase()
                          ) && "bg-accent text-text-dark border-border"
                        )}
                      >
                        {marcacao.status === "concluido"
                          ? "✔️ Concluído"
                          : marcacao.status === "faltou"
                          ? "❌ Faltou"
                          : marcacao.status === "pendente"
                          ? "Pendente"
                          : marcacao.status === "confirmado"
                          ? "Confirmado"
                          : marcacao.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMarcacao(marcacao.id)}
                      className="w-full md:w-auto md:flex-initial"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMarcacao(marcacao.id)}
                      className="w-full md:w-auto md:flex-initial"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(marcacao.id)}
                        className="w-full md:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 md:flex-initial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Botão Criar Marcação */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={handleCreateMarcacao}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-md transition-colors"
            >
              Criar Marcação
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <div className="px-4 py-4 md:px-0 md:py-0">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja apagar esta marcação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col md:flex-row gap-2">
              <AlertDialogCancel onClick={() => setMarcacaoToDelete(null)} className="w-full md:w-auto order-2 md:order-1">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
              >
                Apagar
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

