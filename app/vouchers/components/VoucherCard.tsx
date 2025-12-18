"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Info, Mail, CheckCircle, Trash2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Voucher {
  id: number;
  referencia: string;
  validadeMeses: number;
  valor: number;
  criadoEm: string;
  descricao: string | null;
  observacoes: string | null;
  usado: boolean;
  usadoEm: string | null;
  utente: {
    id: number;
    nomeCompleto: string;
    email: string | null;
  };
  criadoPor: {
    id: string;
    name: string;
    email: string;
  };
}

interface VoucherCardProps {
  voucher: Voucher;
  onUpdate: () => void;
}

export function VoucherCard({ voucher, onUpdate }: VoucherCardProps) {
  const { toast } = useToast();
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const dataValidade = addMonths(new Date(voucher.criadoEm), voucher.validadeMeses);
  const dataValidadeFormatada = format(dataValidade, "PPP", { locale: ptBR });
  const criadoEmFormatado = format(new Date(voucher.criadoEm), "PPP", { locale: ptBR });
  const isExpirado = new Date() > dataValidade && !voucher.usado;

  const getEstadoBadge = () => {
    if (voucher.usado) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          Usado
        </span>
      );
    }
    if (isExpirado) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          Expirado
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        Ativo
      </span>
    );
  };

  const handleMarcarComoUsado = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vouchers/${voucher.id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar como usado");
      }

      onUpdate();
    } catch (error) {
      console.error("Erro ao marcar como usado:", error);
      alert("Erro ao marcar como usado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vouchers/${voucher.id}/enviar-email`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar email");
      }

      toast({
        variant: "success",
        title: "Email enviado com sucesso!",
        description: "O voucher foi enviado por email.",
      });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Erro ao enviar email. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApagar = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vouchers/${voucher.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao apagar voucher");
      }

      onUpdate();
    } catch (error) {
      console.error("Erro ao apagar voucher:", error);
      alert("Erro ao apagar voucher. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow w-full max-w-full overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                <h3 className="text-base md:text-lg font-semibold text-text-dark break-words">
                  {voucher.referencia}
                </h3>
                {getEstadoBadge()}
              </div>
              <p className="text-sm text-text-light mb-2 break-words">
                <span className="font-medium">Utente:</span> {voucher.utente.nomeCompleto}
              </p>
              <p className="text-sm text-text-light mb-2">
                <span className="font-medium">Valor:</span> {voucher.valor.toFixed(2)}€
              </p>
              <p className="text-sm text-text-light mb-2">
                <span className="font-medium">Válido até:</span> {dataValidadeFormatada}
              </p>
              <p className="text-xs text-text-light mt-2">
                Criado em {criadoEmFormatado}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(true)}
                className="h-9 w-9"
                title="Ver informações"
              >
                <Info className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEnviarEmail}
                disabled={loading || !voucher.utente.email || voucher.usado}
                className="h-9 w-9"
                title="Enviar por email"
              >
                <Mail className="w-4 h-4" />
              </Button>
              {!voucher.usado && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="h-9 w-9"
                      title="Marcar como usado"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="px-4 py-4 md:p-6">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar uso do voucher</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem a certeza que deseja marcar o voucher {voucher.referencia} como usado?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col md:flex-row gap-2">
                      <AlertDialogCancel className="w-full md:w-auto order-2 md:order-1">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMarcarComoUsado} className="w-full md:w-auto order-1 md:order-2">
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={loading}
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Apagar voucher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="px-4 py-4 md:p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem a certeza que deseja apagar o voucher {voucher.referencia}? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col md:flex-row gap-2">
                    <AlertDialogCancel className="w-full md:w-auto order-2 md:order-1">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApagar}
                      className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
                    >
                      Apagar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de informações */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="px-4 py-4 md:px-0 md:py-0">
            <DialogHeader>
              <DialogTitle>Informações do Voucher</DialogTitle>
              <DialogDescription>
                Detalhes completos do voucher {voucher.referencia}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium text-text-light">Referência</p>
              <p className="text-base font-semibold">{voucher.referencia}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Utente</p>
              <p className="text-base">{voucher.utente.nomeCompleto}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Valor</p>
              <p className="text-base">{voucher.valor.toFixed(2)}€</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Validade</p>
              <p className="text-base">{dataValidadeFormatada}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Criado por</p>
              <p className="text-base">{voucher.criadoPor.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-light">Data de criação</p>
              <p className="text-base">{criadoEmFormatado}</p>
            </div>
            {voucher.usado && voucher.usadoEm && (
              <div>
                <p className="text-sm font-medium text-text-light">Usado em</p>
                <p className="text-base">
                  {format(new Date(voucher.usadoEm), "PPP", { locale: ptBR })}
                </p>
              </div>
            )}
            {voucher.observacoes && (
              <div>
                <p className="text-sm font-medium text-text-light">Observações internas</p>
                <p className="text-base whitespace-pre-wrap break-words">{voucher.observacoes}</p>
              </div>
            )}
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
