"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, ArrowLeft, Save, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Cliente {
  id: number;
  nomeCompleto: string;
  telemovel?: string | null;
  email?: string | null;
}

export default function NovaMarcacaoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("");
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);
  const [userAlert, setUserAlert] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo: undefined as string | undefined,
    preco: "",
    observacoes: "",
  });

  // Buscar clientes ao carregar a página
  useEffect(() => {
    const fetchClientes = async () => {
      try {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHoraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    
    // Limita a 4 dígitos
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    // Formata como HH:MM
    if (value.length >= 2) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    }
    
    setHora(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
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
      // Combina data e hora
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

      // Mostrar alerta de sucesso
      toast({
        variant: "success",
        title: "Marcação criada!",
        description: "A marcação foi adicionada com sucesso.",
      });

      // Redireciona para o calendário após delay para garantir que o alerta aparece
      setTimeout(() => {
        router.push("/calendario");
      }, 300);
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Nova Marcação</h1>
          <p className="text-text-light mt-2">Agende uma nova consulta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl text-primary">Informações da Marcação</CardTitle>
            <CardDescription>
              Preencha os dados para criar uma nova marcação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Cliente */}
              <div className="md:col-span-2">
                <Label htmlFor="cliente" className="text-base font-semibold">
                  Utente <span className="text-primary">*</span>
                </Label>
                {loadingClientes ? (
                  <div className="mt-2 p-3 border border-border rounded-md text-sm text-text-light">
                    A carregar utentes...
                  </div>
                ) : (
                  <div className="mt-2">
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

              {/* Data */}
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Hora */}
              <div>
                <Label htmlFor="hora" className="text-base font-semibold">
                  Hora <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-2">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
                  <Input
                    id="hora"
                    name="hora"
                    type="text"
                    value={hora}
                    onChange={handleHoraChange}
                    placeholder="HH:MM"
                    maxLength={5}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-text-light mt-1">Formato: HH:MM (ex: 14:30)</p>
              </div>

              {/* Tipo de Marcação */}
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

              {/* Preço */}
              <div>
                <Label htmlFor="preco">Preço (€)</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-2"
                />
              </div>

              {/* Observações */}
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Notas adicionais sobre a marcação..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "A guardar..." : "Guardar Marcação"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

