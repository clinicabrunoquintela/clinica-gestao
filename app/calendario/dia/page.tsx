"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { TimePicker } from "@/components/ui/time-picker";
import { ArrowLeft, CalendarIcon, Clock, Save, User, DollarSign, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Cliente {
  id: number;
  nomeCompleto: string;
  telemovel?: string | null;
  email?: string | null;
}

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

export default function CalendarioDiaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [loadingMarcacoes, setLoadingMarcacoes] = useState(true);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("");
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);

  const [formData, setFormData] = useState({
    tipo: undefined as string | undefined,
    preco: "",
    observacoes: "",
  });

  // Parse da data da URL
  useEffect(() => {
    if (dataParam) {
      try {
        const parsedDate = parseISO(dataParam);
        if (!isNaN(parsedDate.getTime())) {
          setData(parsedDate);
        }
      } catch (error) {
        console.error("Erro ao parsear data:", error);
      }
    }
  }, [dataParam]);

  // Buscar clientes
  useEffect(() => {
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

    fetchClientes();
  }, []);

  // Buscar marcações do dia
  useEffect(() => {
    if (dataParam) {
      fetchMarcacoes();
    }
  }, [dataParam]);

  const fetchMarcacoes = async () => {
    try {
      setLoadingMarcacoes(true);
      const response = await fetch(`/api/marcacoes?data=${dataParam}`);
      if (response.ok) {
        const data = await response.json();
        setMarcacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar marcações:", error);
    } finally {
      setLoadingMarcacoes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!clienteId) {
      alert("Por favor, selecione um utente");
      setLoading(false);
      return;
    }

    if (!data) {
      alert("Por favor, selecione uma data");
      setLoading(false);
      return;
    }

    if (!hora || hora.length !== 5) {
      alert("Por favor, insira uma hora válida (HH:MM)");
      setLoading(false);
      return;
    }

    if (!formData.tipo) {
      alert("Por favor, selecione o tipo de marcação");
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

      // Reset form
      setClienteId(undefined);
      setHora("");
      setFormData({
        tipo: "",
        preco: "",
        observacoes: "",
      });

      // Recarregar marcações
      await fetchMarcacoes();
    } catch (error) {
      console.error("Erro ao criar marcação:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar marcação. Tente novamente.");
    } finally {
      setLoading(false);
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

  if (!data) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:h-full overflow-x-hidden max-w-full w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-shrink-0 mb-4 md:mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="self-start md:self-auto">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">
            {format(data, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Gerencie as marcações deste dia</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 md:flex-1 md:min-h-0">
        {/* Formulário de Nova Marcação */}
        <Card className="border-primary/20 shadow-lg flex flex-col md:min-h-0">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex-shrink-0">
            <CardTitle className="text-xl md:text-2xl text-primary">Nova Marcação</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Adicione uma nova marcação para este dia
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 md:flex-1 md:overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                      onChange={(val) => setClienteId(val as number | undefined)}
                      placeholder="Selecione um utente..."
                    />
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
                    <TimePicker value={hora} onChange={setHora} label="Selecionar hora" />
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
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "A guardar..." : "Guardar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Marcações */}
        <Card className="flex flex-col md:min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-xl md:text-base">Marcações do Dia</CardTitle>
            <CardDescription className="text-sm md:text-base">
              {marcacoes.length === 0
                ? "Nenhuma marcação agendada"
                : `${marcacoes.length} marcação${marcacoes.length > 1 ? "ões" : ""} agendada${marcacoes.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="md:flex-1 md:overflow-y-auto md:min-h-0">
            {loadingMarcacoes ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-text-light">A carregar marcações...</p>
              </div>
            ) : marcacoes.length === 0 ? (
              <div className="text-center py-8 text-text-light">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma marcação para este dia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {marcacoes
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((marcacao) => (
                    <div
                      key={marcacao.id}
                      className="p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-text-dark text-base md:text-base">
                              {marcacao.hora}
                            </span>
                            {getStatusBadge(marcacao.status)}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-medium text-text-dark text-base md:text-base">
                              {marcacao.cliente.nomeCompleto}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm md:text-sm text-text-light">{marcacao.tipo}</span>
                          </div>
                          {marcacao.preco && (
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span className="text-sm text-text-light">
                                €{marcacao.preco.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {marcacao.observacoes && (
                            <div className="flex items-start gap-2 mt-2">
                              <FileText className="w-4 h-4 text-primary mt-0.5" />
                              <p className="text-sm text-text-light">{marcacao.observacoes}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/marcacoes/${marcacao.id}`)}
                          className="w-full md:w-auto"
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
