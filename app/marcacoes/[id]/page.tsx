"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, FileText, Euro as EuroIcon, CreditCard, CheckSquare, ThumbsDown, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Marcacao {
  id: number;
  clienteId: number;
  data: string;
  hora: string;
  tipo: string;
  preco: number | null;
  observacoes: string | null;
  status: string;
  pagamento: string | null;
  presenca: boolean | null;
  falta: boolean | null;
  createdAt: string;
  cliente: {
    id: number;
    nomeCompleto: string;
    telemovel: string | null;
    email: string | null;
  };
}

export default function MarcacaoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [marcacao, setMarcacao] = useState<Marcacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Date | undefined>(undefined);
  const [editHora, setEditHora] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMarcacao = async () => {
      try {
        const response = await fetch(`/api/marcacoes/${params.id}`);
        if (!response.ok) {
          throw new Error("Marcação não encontrada");
        }
        const data = await response.json();
        setMarcacao(data);
        // Inicializar valores de edição
        setEditData(new Date(data.data));
        setEditHora(data.hora || "");
        setEditTipo(data.tipo || "");
        setEditPreco(data.preco ? data.preco.toString() : "");
      } catch (error) {
        console.error("Erro ao buscar marcação:", error);
        router.push("/calendario");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMarcacao();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-light">A carregar...</p>
      </div>
    );
  }

  if (!marcacao) {
    return null;
  }

  const handleDelete = async () => {
    if (!marcacao) return;

    try {
      const response = await fetch(`/api/marcacoes/${marcacao.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/calendario");
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao apagar marcação",
          description: "Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao apagar marcação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao apagar marcação",
        description: "Tente novamente.",
      });
    }
  };

  const handleStartEdit = () => {
    if (!marcacao) return;
    setEditData(new Date(marcacao.data));
    setEditHora(marcacao.hora || "");
    setEditTipo(marcacao.tipo || "");
    setEditPreco(marcacao.preco ? marcacao.preco.toString() : "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!marcacao) return;
    setEditData(new Date(marcacao.data));
    setEditHora(marcacao.hora || "");
    setEditTipo(marcacao.tipo || "");
    setEditPreco(marcacao.preco ? marcacao.preco.toString() : "");
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!marcacao || !editData || !editHora || !editTipo) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    // Validar formato da hora (HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editHora)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira uma hora válida no formato HH:MM.",
      });
      return;
    }

    setSaving(true);
    try {
      const [hours, minutes] = editHora.split(":");
      const dataHora = new Date(editData);
      dataHora.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const response = await fetch(`/api/marcacoes/${marcacao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: marcacao.clienteId,
          data: dataHora.toISOString(),
          hora: editHora,
          tipo: editTipo,
          preco: editPreco ? parseFloat(editPreco) : null,
          observacoes: marcacao.observacoes,
          status: marcacao.status,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setMarcacao(updated);
        // Atualizar estados de edição com os novos valores
        setEditData(new Date(updated.data));
        setEditHora(updated.hora || "");
        setEditTipo(updated.tipo || "");
        setEditPreco(updated.preco ? updated.preco.toString() : "");
        setIsEditing(false);
        
        // Mostrar alerta de sucesso
        toast({
          variant: "success",
          title: "Marcação atualizada com sucesso!",
          description: "As alterações foram guardadas.",
        });
        
        // Refresh após delay para garantir que o alerta aparece
        setTimeout(() => {
          router.refresh();
        }, 300);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar marcação");
      }
    } catch (error) {
      console.error("Erro ao atualizar marcação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar marcação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Detalhes da Marcação</h1>
            <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Informações completas da marcação</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setDeleteDialogOpen(true)}
          className="w-full md:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Apagar Marcação
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações da Marcação */}
        <Card>
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Informações da Marcação
              </CardTitle>
              <div className="flex items-center gap-3">
                <Label htmlFor="edit-toggle" className="text-sm font-medium text-neutral-700 cursor-pointer">
                  Editar
                </Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEditing}
                  id="edit-toggle"
                  onClick={() => {
                    if (isEditing) {
                      handleCancelEdit();
                    } else {
                      handleStartEdit();
                    }
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
                    isEditing ? "bg-[#F97316]" : "bg-neutral-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isEditing ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-text-light">Utente</p>
                <p className="font-medium">{marcacao.cliente.nomeCompleto}</p>
                {marcacao.cliente.telemovel && (
                  <p className="text-sm text-text-light mt-1">
                    {marcacao.cliente.telemovel}
                  </p>
                )}
                {marcacao.cliente.email && (
                  <p className="text-sm text-text-light">
                    {marcacao.cliente.email}
                  </p>
                )}
              </div>
            </div>

            {!isEditing ? (
              <>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-light">Data e Hora</p>
                    <p className="font-medium">
                      {format(new Date(marcacao.data), "PPP", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-text-light mt-1">
                      {marcacao.hora}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-text-light">Tipo</p>
                  <p className="font-medium">{marcacao.tipo}</p>
                </div>

                {marcacao.preco && (
                  <div>
                    <p className="text-sm text-text-light">Preço</p>
                    <p className="font-medium">€{marcacao.preco.toFixed(2)}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Data <span className="text-primary">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-2 justify-start text-left font-normal",
                            !editData && "text-text-light"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editData ? (
                            format(editData, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editData}
                          onSelect={setEditData}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="hora" className="text-base font-semibold">
                      Hora <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2">
                      <TimePicker value={editHora} onChange={setEditHora} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo" className="text-base font-semibold">
                      Tipo de Marcação <span className="text-primary">*</span>
                    </Label>
                    <Select
                      value={editTipo || ""}
                      onValueChange={(value) => setEditTipo(value || "")}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ª Avaliação">1ª Avaliação</SelectItem>
                        <SelectItem value="Consulta">Consulta</SelectItem>
                        <SelectItem value="Reavaliação">Reavaliação</SelectItem>
                        <SelectItem value="Tratamento">Tratamento</SelectItem>
                        <SelectItem value="Mostrar exame">Mostrar exame</SelectItem>
                        <SelectItem value="Diversos">Diversos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="preco">Preço (€)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPreco}
                      onChange={(e) => setEditPreco(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <p className="text-sm text-text-light mb-2">Status</p>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  marcacao.status === "concluido"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : marcacao.status === "faltou"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : marcacao.status === "pendente"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : marcacao.status === "confirmado"
                    ? "bg-primary text-white"
                    : "bg-accent text-text-dark"
                }`}
              >
                {marcacao.status === "concluido"
                  ? "Concluído"
                  : marcacao.status === "faltou"
                  ? "Faltou"
                  : marcacao.status === "pendente"
                  ? "Pendente"
                  : marcacao.status === "confirmado"
                  ? "Confirmado"
                  : marcacao.status}
              </span>
            </div>

            {isEditing && (
              <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="w-full md:w-auto order-2 md:order-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="w-full md:w-auto order-1 md:order-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "A guardar..." : "Guardar alterações"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagamento e Presença */}
        <Card>
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <EuroIcon className="w-5 h-5 text-primary" />
              Pagamento e Presença
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-text-light mb-2">Forma de Pagamento</p>
              <div className="flex items-center gap-2">
                {marcacao.pagamento === "cartao" && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#16a34a]" />
                    <span className="text-sm font-medium">Cartão</span>
                  </div>
                )}
                {marcacao.pagamento === "dinheiro" && (
                  <div className="flex items-center gap-2">
                    <EuroIcon className="w-5 h-5 text-[#16a34a]" />
                    <span className="text-sm font-medium">Dinheiro</span>
                  </div>
                )}
                {!marcacao.pagamento && (
                  <span className="text-sm text-text-light">Não pago</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-text-light mb-3">Presença</p>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <Button
                  variant={marcacao.presenca ? "default" : "outline"}
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/marcacoes/${marcacao.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          presenca: !marcacao.presenca,
                          falta: false,
                        }),
                      });
                      if (response.ok) {
                        const updated = await response.json();
                        setMarcacao(updated);
                        router.refresh();
                      }
                    } catch (error) {
                      console.error("Erro ao atualizar presença:", error);
                    }
                  }}
                  className={`w-full md:w-auto ${marcacao.presenca ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Confirmar presença
                </Button>
                <Button
                  variant={marcacao.falta ? "destructive" : "outline"}
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/marcacoes/${marcacao.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          falta: !marcacao.falta,
                          presenca: false,
                        }),
                      });
                      if (response.ok) {
                        const updated = await response.json();
                        setMarcacao(updated);
                        router.refresh();
                      }
                    } catch (error) {
                      console.error("Erro ao atualizar falta:", error);
                    }
                  }}
                  className="w-full md:w-auto"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Assinalar falta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {marcacao.observacoes && (
          <Card className="md:col-span-2">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-text-dark whitespace-pre-wrap">{marcacao.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>

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
              <AlertDialogCancel className="w-full md:w-auto order-2 md:order-1">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
              >
                Apagar
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
