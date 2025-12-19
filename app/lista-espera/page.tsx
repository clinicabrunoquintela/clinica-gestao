"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useToast } from "@/components/ui/use-toast";
import { TIPOS_MARCACAO_ARRAY } from "@/lib/marcacao-types";
import { CalendarIcon, Bell, Trash2, Save } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Cliente {
  id: number;
  nomeCompleto: string;
  telemovel?: string | null;
  email?: string | null;
}

interface ListaEsperaEntry {
  id: number;
  prioridade: string;
  terapeuta: string | null;
  tipoMarcacao: string | null;
  dataInicial: string | null;
  dataFinal: string | null;
  observacoes: string | null;
  criadoPor: string | null;
  criadoEm: string;
  utente: {
    id: number;
    nomeCompleto: string;
    email: string | null;
    telemovel: string | null;
  };
}

export default function ListaEsperaPage() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [entradas, setEntradas] = useState<ListaEsperaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  // Form state
  const [utenteId, setUtenteId] = useState<number | undefined>(undefined);
  const [prioridade, setPrioridade] = useState<string | undefined>(undefined);
  const [terapeuta, setTerapeuta] = useState<string | undefined>(undefined);
  const [terapeutaOutro, setTerapeutaOutro] = useState("");
  const [tipoMarcacao, setTipoMarcacao] = useState<string | undefined>(undefined);
  const [dataInicial, setDataInicial] = useState<Date | undefined>(undefined);
  const [dataFinal, setDataFinal] = useState<Date | undefined>(undefined);
  const [observacoes, setObservacoes] = useState("");

  // Filters
  const [filtroPrioridade, setFiltroPrioridade] = useState<string | undefined>(undefined);
  const [filtroTerapeuta, setFiltroTerapeuta] = useState<string | undefined>(undefined);
  const [filtroTipoMarcacao, setFiltroTipoMarcacao] = useState<string | undefined>(undefined);
  const [filtroDataInicial, setFiltroDataInicial] = useState<Date | undefined>(undefined);
  const [filtroDataFinal, setFiltroDataFinal] = useState<Date | undefined>(undefined);
  const [filtroSort, setFiltroSort] = useState("criadoEm");

  useEffect(() => {
    fetchClientes();
    fetchEntradas();
  }, []);

  useEffect(() => {
    fetchEntradas();
  }, [filtroPrioridade, filtroTerapeuta, filtroTipoMarcacao, filtroDataInicial, filtroDataFinal, filtroSort]);

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

  const fetchEntradas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroPrioridade) params.append("prioridade", filtroPrioridade);
      if (filtroTerapeuta) params.append("terapeuta", filtroTerapeuta);
      if (filtroTipoMarcacao) params.append("tipoMarcacao", filtroTipoMarcacao);
      if (filtroDataInicial) params.append("dataInicial", filtroDataInicial.toISOString());
      if (filtroDataFinal) params.append("dataFinal", filtroDataFinal.toISOString());
      params.append("sort", filtroSort);

      const response = await fetch(`/api/lista-espera?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEntradas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar lista de espera:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utenteId || !prioridade) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
      });
      return;
    }

    try {
      const response = await fetch("/api/lista-espera", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utenteId,
          prioridade: prioridade || null,
          terapeuta: terapeuta === "Outro" ? terapeutaOutro : (terapeuta || null),
          tipoMarcacao: tipoMarcacao || null,
          dataInicial: dataInicial ? dataInicial.toISOString() : null,
          dataFinal: dataFinal ? dataFinal.toISOString() : null,
          observacoes: observacoes.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar entrada");
      }

      // Mostrar alerta de sucesso IMEDIATAMENTE após sucesso da API (ANTES de qualquer ação)
      console.log("ALERTA DISPARADO - Utente adicionado à lista de espera");
      toast({
        variant: "success",
        title: "Utente adicionado à lista de espera",
        description: "O utente foi inserido com sucesso na lista de espera.",
      });

      // Reset form
      setUtenteId(undefined);
      setPrioridade(undefined);
      setTerapeuta(undefined);
      setTerapeutaOutro("");
      setTipoMarcacao(undefined);
      setDataInicial(undefined);
      setDataFinal(undefined);
      setObservacoes("");
      setShowForm(false);

      fetchEntradas();
    } catch (error) {
      console.error("Erro ao criar entrada:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar entrada",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingAction(id);
    try {
      const response = await fetch("/api/lista-espera/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao apagar entrada");
      }

      fetchEntradas();
    } catch (error) {
      console.error("Erro ao apagar entrada:", error);
      alert("Erro ao apagar entrada. Tente novamente.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleNotify = async (id: number) => {
    setLoadingAction(id);
    try {
      const response = await fetch("/api/lista-espera/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar lembrete");
      }

      alert("Lembrete criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar lembrete:", error);
      alert("Erro ao criar lembrete. Tente novamente.");
    } finally {
      setLoadingAction(null);
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Alta":
        return "bg-red-500";
      case "Média":
        return "bg-orange-500";
      case "Baixa":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const diasInserido = (criadoEm: string) => {
    return differenceInDays(new Date(), new Date(criadoEm));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-dark">Lista de Espera</h1>
        <p className="text-text-light mt-2">Gerencie a lista de espera dos utentes</p>
      </div>

      {/* Barra de pesquisa */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-[#f8f6f2] border-b border-primary/10">
          <CardTitle className="text-xl text-primary">Pesquisar Utente</CardTitle>
          <CardDescription>
            Selecione um utente para adicionar à lista de espera
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loadingClientes ? (
            <div className="p-3 border border-border rounded-md text-sm text-text-light">
              A carregar utentes...
            </div>
          ) : (
            <SearchableSelect
              variant="utente"
              options={clientes.map((c) => ({
                value: c.id,
                label: `${c.nomeCompleto} — ${c.telemovel || "sem telefone"}`,
              }))}
              value={utenteId}
              onChange={(val) => {
                setUtenteId(val as number | undefined);
                setShowForm(!!val);
              }}
              placeholder="Pesquise e selecione um utente..."
            />
          )}
        </CardContent>
      </Card>

      {/* Formulário de inserção */}
      {showForm && utenteId && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-[#f8f6f2] border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Inserir Utente na Lista de Espera</CardTitle>
            <CardDescription>
              Preencha os dados para adicionar o utente à lista de espera
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prioridade" className="text-base font-semibold">
                    Prioridade <span className="text-primary">*</span>
                  </Label>
                  <Select value={prioridade || ""} onValueChange={(val) => setPrioridade(val || undefined)}>
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="terapeuta" className="text-base font-semibold">
                    Terapeuta
                  </Label>
                  <Select value={terapeuta || ""} onValueChange={(val) => setTerapeuta(val || undefined)}>
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue placeholder="Selecione o terapeuta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bruno Quintela">Bruno Quintela</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {terapeuta === "Outro" && (
                    <Input
                      value={terapeutaOutro}
                      onChange={(e) => setTerapeutaOutro(e.target.value)}
                      placeholder="Nome do terapeuta"
                      className="mt-2 h-10"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="tipoMarcacao" className="text-base font-semibold">
                    Tipo de Marcação
                  </Label>
                  <Select value={tipoMarcacao || ""} onValueChange={(val) => setTipoMarcacao(val || undefined)}>
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_MARCACAO_ARRAY.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Dia Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-2 h-10 justify-start text-left font-normal",
                          !dataInicial && "text-text-light"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicial ? (
                          format(dataInicial, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataInicial}
                        onSelect={setDataInicial}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-base font-semibold">Dia Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-2 h-10 justify-start text-left font-normal",
                          !dataFinal && "text-text-light"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFinal ? (
                          format(dataFinal, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataFinal}
                        onSelect={setDataFinal}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre esta entrada..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setUtenteId(undefined);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-dark text-white w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Inserir utente na Lista de Espera
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-[#f8f6f2] border-b border-primary/10">
          <CardTitle className="text-xl text-primary">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Ordenar Por</Label>
              <Select value={filtroSort} onValueChange={setFiltroSort}>
                <SelectTrigger className="mt-2 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criadoEm">Inserção</SelectItem>
                  <SelectItem value="prioridade">Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prioridade</Label>
              <Select value={filtroPrioridade || ""} onValueChange={(val) => setFiltroPrioridade(val || undefined)}>
                <SelectTrigger className="mt-2 h-10">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Terapeuta</Label>
              <Select value={filtroTerapeuta || ""} onValueChange={(val) => setFiltroTerapeuta(val || undefined)}>
                <SelectTrigger className="mt-2 h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bruno Quintela">Bruno Quintela</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Marcação</Label>
              <Select value={filtroTipoMarcacao || ""} onValueChange={(val) => setFiltroTipoMarcacao(val || undefined)}>
                <SelectTrigger className="mt-2 h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MARCACAO_ARRAY.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-2 h-10 justify-start text-left font-normal",
                      !filtroDataInicial && "text-text-light"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroDataInicial ? (
                      format(filtroDataInicial, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataInicial}
                    onSelect={setFiltroDataInicial}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-2 h-10 justify-start text-left font-normal",
                      !filtroDataFinal && "text-text-light"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroDataFinal ? (
                      format(filtroDataFinal, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroDataFinal}
                    onSelect={setFiltroDataFinal}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de entradas */}
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-[#f8f6f2] border-b border-primary/10">
          <CardTitle className="text-xl text-primary">Lista de Espera</CardTitle>
          <CardDescription>
            {loading
              ? "A carregar..."
              : `${entradas.length} ${entradas.length === 1 ? "entrada" : "entradas"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">A carregar lista de espera...</p>
            </div>
          ) : entradas.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">Nenhuma entrada na lista de espera.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {entradas.map((entrada) => (
                <AccordionItem key={entrada.id} value={`item-${entrada.id}`}>
                  <AccordionTrigger className="px-4 py-3 hover:bg-accent rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn("w-3 h-3 rounded-full", getPrioridadeColor(entrada.prioridade))} />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-text-dark">{entrada.utente.nomeCompleto}</p>
                        <p className="text-sm text-text-light">
                          {entrada.terapeuta || "Sem terapeuta"} • {entrada.tipoMarcacao || "Sem tipo"} • Inserido há {diasInserido(entrada.criadoEm)} {diasInserido(entrada.criadoEm) === 1 ? "dia" : "dias"}
                        </p>
                        {entrada.criadoPor && (
                          <p className="text-xs text-text-light mt-1">
                            Inserido por: {entrada.criadoPor}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotify(entrada.id);
                          }}
                          disabled={loadingAction === entrada.id}
                          className="h-9 w-9"
                          title="Adicionar lembrete"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                              disabled={loadingAction === entrada.id}
                              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Apagar entrada"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <div className="px-4 py-4 md:px-0 md:py-0">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem a certeza que deseja apagar esta entrada da lista de espera? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col md:flex-row gap-2">
                                <AlertDialogCancel className="w-full md:w-auto order-2 md:order-1">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(entrada.id)}
                                  className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
                                >
                                  Apagar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 pt-2">
                      {entrada.dataInicial && entrada.dataFinal && (
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="font-medium text-text-light">Data Inicial:</span>{" "}
                            <span className="text-text-dark">
                              {format(new Date(entrada.dataInicial), "PPP", { locale: ptBR })}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-text-light">Data Final:</span>{" "}
                            <span className="text-text-dark">
                              {format(new Date(entrada.dataFinal), "PPP", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      )}
                      {entrada.observacoes && (
                        <div>
                          <p className="font-medium text-text-light text-sm mb-1">Observações:</p>
                          <p className="text-text-dark whitespace-pre-wrap">{entrada.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
