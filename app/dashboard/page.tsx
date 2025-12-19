"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Users,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Mail,
  CreditCard,
  Euro,
  CheckSquare,
  Square,
  ThumbsDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  AlertTriangle,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Stats {
  totalClientes: number;
  totalHomens: number;
  totalMulheres: number;
  marcacoesHoje: number;
  mediaIdades: number;
  marcacoesFuturas: number;
}

interface Marcacao {
  id: number;
  cliente: {
    id: number;
    nomeCompleto: string;
    alertas?: string | null;
  };
  hora: string;
  tipo: string;
  status: string;
  preco?: number | null;
  pagamento?: string | null;
  presenca?: boolean | null;
  falta?: boolean | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [marcacoesHoje, setMarcacoesHoje] = useState<Marcacao[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marcacaoToDelete, setMarcacaoToDelete] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const initialLoadDone = useRef(false);

  const fetchMarcacoes = React.useCallback(async (data: Date) => {
    try {
      const dataStr = format(data, "yyyy-MM-dd");
      const response = await fetch(`/api/marcacoes?data=${dataStr}`);
      if (response.ok) {
        const data = await response.json();
        setMarcacoesHoje(data);
      }
    } catch (error) {
      console.error("Erro ao buscar marcações:", error);
    }
  }, []);

  // Load inicial unificado - executa apenas uma vez
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar estatísticas e marcações em paralelo
        const [statsResponse, marcacoesData] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch(`/api/marcacoes?data=${format(selectedDate, "yyyy-MM-dd")}`),
        ]);

        // Processar estatísticas
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Processar marcações
        if (marcacoesData.ok) {
          const marcacoes = await marcacoesData.json();
          setMarcacoesHoje(marcacoes);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        // Desativar loading inicial apenas uma vez
        setInitialLoading(false);
        initialLoadDone.current = true;
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualizar marcações quando a data muda (após o load inicial)
  useEffect(() => {
    // Não executar no mount inicial (já buscamos no load inicial)
    if (initialLoadDone.current) {
      fetchMarcacoes(selectedDate);
    }
  }, [selectedDate, fetchMarcacoes]);

  // Listener para actualizações externas (ex: modal de criar marcação)
  useEffect(() => {
    const onMarcacaoCreated = (ev: Event) => {
      try {
        // Refetch silencioso quando uma nova marcação é criada
        fetchMarcacoes(selectedDate);
      } catch (err) {
        console.error("Erro a processar marcacao:created", err);
      }
    };

    window.addEventListener("marcacao:created", onMarcacaoCreated);
    return () => {
      window.removeEventListener("marcacao:created", onMarcacaoCreated);
    };
  }, [selectedDate, fetchMarcacoes]);

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleUpdateMarcacao = async (
    id: number,
    updates: { pagamento?: string | null; presenca?: boolean; falta?: boolean }
  ) => {
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/marcacoes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedMarcacao = await response.json();
        // Atualizar apenas a marcação afetada no estado local
        setMarcacoesHoje((prev) =>
          prev.map((m) => (m.id === id ? updatedMarcacao : m))
        );
      } else {
        console.error("Erro ao atualizar marcação");
      }
    } catch (error) {
      console.error("Erro ao atualizar marcação:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMarcacao = async () => {
    if (!marcacaoToDelete) return;

    try {
      const response = await fetch(`/api/marcacoes/${marcacaoToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remover apenas a marcação apagada do estado local
        setMarcacoesHoje((prev) => prev.filter((m) => m.id !== marcacaoToDelete));
        setDeleteDialogOpen(false);
        setMarcacaoToDelete(null);
      } else {
        console.error("Erro ao deletar marcação");
      }
    } catch (error) {
      console.error("Erro ao deletar marcação:", error);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Marcações do Dia", 14, 20);
    doc.setFontSize(12);
    doc.text(`Data: ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`, 14, 30);

    const rows = marcacoesHoje.map((m) => [
      m.hora,
      m.cliente.nomeCompleto,
      m.tipo,
      m.preco ? `${m.preco} €` : "-",
      m.status,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Hora", "Utente", "Tipo", "Preço", "Estado"]],
      body: rows,
    });

    doc.save(`marcacoes-${format(selectedDate, "yyyy-MM-dd", { locale: ptBR })}.pdf`);
  };

  const handleSendEmail = async () => {
    try {
      const res = await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate.toISOString() }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          variant: "success",
          title: "Email enviado com sucesso!",
          description: "O PDF com as marcações foi enviado por email.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: data.error || "Erro desconhecido",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Ocorreu um erro ao enviar o email. Tente novamente.",
      });
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
        className={`text-xs font-medium px-3 py-1 rounded-full border ${statusInfo.className}`}
      >
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#F28C1D" }}>
          Dashboard
        </h1>
        <p className="text-text-light mt-2">Bem-vindo ao sistema de gestão</p>
      </div>

      {/* Stats Grid */}
      {initialLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Utentes</CardTitle>
              <Users className="h-5 w-5" style={{ color: "#F28C1D" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-dark">
                {stats?.totalClientes || 0}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-light">
                <span>👨 Homens: {stats?.totalHomens || 0}</span>
                <span>👩 Mulheres: {stats?.totalMulheres || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marcações Hoje</CardTitle>
              <CalendarIcon className="h-5 w-5" style={{ color: "#F28C1D" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-dark">
                {stats?.marcacoesHoje || 0}
              </div>
              <p className="text-xs text-text-light mt-1">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Idades</CardTitle>
              <TrendingUp className="h-5 w-5" style={{ color: "#F28C1D" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-dark">
                {stats?.mediaIdades || 0}
              </div>
              <p className="text-xs text-text-light mt-1">Anos</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-mails enviados hoje</CardTitle>
              <Mail className="h-5 w-5" style={{ color: "#F28C1D" }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-dark">0</div>
              <p className="text-xs text-text-light mt-1">Hoje</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Marcações do Dia */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="border-b border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl" style={{ color: "#F28C1D" }}>
                Marcações do Dia
              </CardTitle>
              <CardDescription className="text-sm">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevDay}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 md:w-[200px] flex items-center justify-center text-center font-medium text-sm",
                        !selectedDate && "text-text-light"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 flex justify-center"
                    align="center"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextDay}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGeneratePDF}
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="Exportar PDF"
                >
                  <FileDown className="w-5 h-5 text-primary" />
                </button>
                <button
                  onClick={handleSendEmail}
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="Enviar PDF por Email"
                >
                  <Mail className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">A carregar marcações...</p>
            </div>
          ) : marcacoesHoje.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">
                Nenhuma marcação para {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {marcacoesHoje.map((marcacao) => (
                <div
                  key={marcacao.id}
                  onClick={() => router.push(`/marcacoes/${marcacao.id}`)}
                  className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:bg-[#fffdf9] hover:border-primary/40 cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-primary/20 rounded-lg group gap-3"
                >
                  <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {marcacao.cliente.alertas && marcacao.cliente.alertas.trim() !== "" && (
                          <>
                            {/* Desktop: Tooltip com hover */}
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="hidden md:inline-flex"
                                    aria-label="Ver alertas do utente"
                                  >
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs p-3 text-sm bg-white shadow-md border rounded-md">
                                  <p className="font-semibold mb-1">Alertas do utente:</p>
                                  <ul className="list-disc ml-4">
                                    {marcacao.cliente.alertas
                                      .split(',')
                                      .map((a, idx) => (
                                        <li key={idx}>{a.trim()}</li>
                                      ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {/* Mobile: Popover com tap */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="md:hidden"
                                  aria-label="Ver alertas do utente"
                                >
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent 
                                className="w-[90vw] max-w-sm p-4 text-sm bg-white shadow-lg border rounded-lg"
                                align="center"
                                sideOffset={8}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="font-semibold mb-2 text-text-dark">Alertas do utente:</p>
                                <ul className="list-disc ml-4 space-y-1 text-text-dark break-words leading-relaxed">
                                  {marcacao.cliente.alertas
                                    .split(',')
                                    .map((a, idx) => (
                                      <li key={idx} className="break-words">{a.trim()}</li>
                                    ))}
                                </ul>
                              </PopoverContent>
                            </Popover>
                          </>
                        )}
                        <span className="font-semibold text-text-dark break-words">
                          {marcacao.cliente.nomeCompleto}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-text-light flex-shrink-0" />
                          <span className="text-sm text-text-light">{marcacao.hora}</span>
                        </div>
                        <span className="text-sm text-text-light hidden md:inline">•</span>
                        <span className="text-sm text-text-light">{marcacao.tipo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Ícones de Pagamento */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateMarcacao(marcacao.id, {
                          pagamento: marcacao.pagamento === "cartao" ? null : "cartao",
                        });
                      }}
                      disabled={updatingId === marcacao.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      title="Pagamento por Cartão"
                    >
                      <CreditCard
                        size={20}
                        className={cn(
                          "transition-all duration-200 cursor-pointer hover:scale-110",
                          marcacao.pagamento === "cartao"
                            ? "!text-[#16a34a]"
                            : "text-[#9ca3af]"
                        )}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateMarcacao(marcacao.id, {
                          pagamento: marcacao.pagamento === "dinheiro" ? null : "dinheiro",
                        });
                      }}
                      disabled={updatingId === marcacao.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      title="Pagamento em Dinheiro"
                    >
                      <Euro
                        size={20}
                        className={cn(
                          "transition-all duration-200 cursor-pointer hover:scale-110",
                          marcacao.pagamento === "dinheiro"
                            ? "!text-[#16a34a]"
                            : "text-[#9ca3af]"
                        )}
                      />
                    </button>

                    {/* Checkbox de Presença */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateMarcacao(marcacao.id, {
                          presenca: !marcacao.presenca,
                          falta: false,
                        });
                      }}
                      disabled={updatingId === marcacao.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      title="Marcar Presença"
                    >
                      {marcacao.presenca ? (
                        <CheckSquare
                          size={20}
                          className={cn(
                            "transition-all duration-200 cursor-pointer hover:scale-110",
                            "!text-[#16a34a]"
                          )}
                        />
                      ) : (
                        <Square
                          size={20}
                          className={cn(
                            "transition-all duration-200 cursor-pointer hover:scale-110",
                            "text-[#9ca3af]"
                          )}
                        />
                      )}
                    </button>

                    {/* Ícone de Falta */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateMarcacao(marcacao.id, {
                          falta: !marcacao.falta,
                          presenca: false,
                        });
                      }}
                      disabled={updatingId === marcacao.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      title="Marcar Falta"
                    >
                      <ThumbsDown
                        size={20}
                        className={cn(
                          "transition-all duration-200 cursor-pointer hover:scale-110",
                          marcacao.falta ? "!text-[#16a34a]" : "text-[#9ca3af]"
                        )}
                      />
                    </button>

                    {/* Ícone de Deletar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMarcacaoToDelete(marcacao.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer transition-all duration-200 hover:scale-110"
                      title="Apagar Marcação"
                    >
                      <Trash2
                        size={20}
                        className="transition-all duration-200 cursor-pointer hover:scale-110 text-[#9ca3af] hover:text-red-600"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta marcação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMarcacaoToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMarcacao}
              className="bg-red-600 hover:bg-red-700"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
