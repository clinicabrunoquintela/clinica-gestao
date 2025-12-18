"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CalendarIcon, Clock, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/time-picker";
import { useToast } from "@/components/ui/use-toast";

interface Cliente {
  id: number;
  nomeCompleto: string;
  telemovel?: string | null;
  email?: string | null;
}

interface AdicionarMarcacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

export function AdicionarMarcacaoDialog({
  open,
  onOpenChange,
  initialDate,
}: AdicionarMarcacaoDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [data, setData] = useState<Date | undefined>(initialDate || new Date());
  const [hora, setHora] = useState("");
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);
  const [userAlert, setUserAlert] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo: undefined as string | undefined,
    preco: "",
    observacoes: "",
  });

  useEffect(() => {
    if (open) {
      fetchClientes();
      if (initialDate) {
        setData(initialDate);
      }
    } else {
      // Reset form quando o modal fecha
      setClienteId(undefined);
      setUserAlert(null);
      setHora("");
      setFormData({
        tipo: "",
        preco: "",
        observacoes: "",
      });
    }
  }, [open, initialDate]);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch("/api/clientes");
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar utentes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!clienteId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um utente",
      });
      setLoading(false);
      return;
    }

    if (!data) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma data",
      });
      setLoading(false);
      return;
    }

    if (!hora || hora.length !== 5) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira uma hora válida (HH:MM)",
      });
      setLoading(false);
      return;
    }

    if (!formData.tipo) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione o tipo de marcação",
      });
      setLoading(false);
      return;
    }

    try {
      const [hours, minutes] = hora.split(":");
      const dataHora = new Date(data);
      dataHora.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch("/api/marcacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId,
          data: dataHora.toISOString(),
          hora,
          tipo: formData.tipo,
          preco: formData.preco ? parseFloat(formData.preco) : null,
          observacoes: formData.observacoes || null,
          status: "pendente",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar marcação");
      }

      const created = await response.json();

      // Reset form
      setClienteId(undefined);
      setUserAlert(null);
      setData(new Date());
      setHora("");
      setFormData({
        tipo: "",
        preco: "",
        observacoes: "",
      });

      // Show success toast immediately
      toast({
        variant: "success",
        title: "Marcação criada!",
        description: "A marcação foi adicionada com sucesso.",
      });

      // Close dialog automatically
      onOpenChange(false);

      // Disparar evento global para atualizar dashboard (após fechar o modal)
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("marcacao:created", {
            detail: {
              id: created.id,
              date: created.data || dataHora.toISOString(),
            },
          })
        );
      }, 100);
    } catch (error) {
      console.error("Erro ao criar marcação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar marcação",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-4 md:px-0 md:py-0">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: "#F28C1D" }}>
              Nova Marcação
            </DialogTitle>
            <DialogDescription>
              Crie uma nova marcação rapidamente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
          <div>
            <Label htmlFor="cliente" className="text-base font-semibold">
              Utente <span className="text-primary">*</span>
            </Label>
            {loadingClientes ? (
              <div className="mt-2 p-3 border border-border rounded-md text-sm text-text-light">
                A carregar utentes...
              </div>
            ) : (
              <div className="mt-2 w-full">
                <SearchableSelect
                  variant="utente"
                  options={clientes.map((c) => ({
                    value: c.id,
                    label: `${c.nomeCompleto} — ${c.telemovel || "sem telefone"}`,
                  }))}
                  value={clienteId}
                  onChange={async (val) => {
                    setClienteId(val as number | undefined);
                    if (val) {
                      try {
                        const response = await fetch(`/api/clientes/${val}`);
                        if (response.ok) {
                          const data = await response.json();
                          setUserAlert(data.alertas || null);
                        } else {
                          setUserAlert(null);
                        }
                      } catch (error) {
                        console.error("Erro ao buscar alerta:", error);
                        setUserAlert(null);
                      }
                    } else {
                      setUserAlert(null);
                    }
                  }}
                  placeholder="Selecione um utente..."
                />
                {userAlert && (
                  <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>{userAlert}</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
                      !data && "text-text-light"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? (
                      format(data, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
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
                <TimePicker value={hora} onChange={setHora} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo" className="text-base font-semibold">
                Tipo de Marcação <span className="text-primary">*</span>
              </Label>
              <Select
                value={formData.tipo || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipo: value || undefined }))
                }
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
                value={formData.preco}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, preco: e.target.value }))
                }
                placeholder="0.00"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
              }
              placeholder="Notas adicionais..."
              className="mt-2 min-h-[80px]"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full md:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
