"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { UtenteSummary } from "@/components/calendario/UtenteSummary";
import { CalendarYearWithEvents } from "@/components/calendario/CalendarYearWithEvents";
import { DayModal } from "@/components/calendario/DayModal";
import { TIPOS_MARCACAO } from "@/components/calendario/CalendarUtils";
import { format } from "date-fns";

interface Cliente {
  id: number;
  nomeCompleto: string;
  nif?: string | null;
  telemovel?: string | null;
}

interface MarcacaoUtente {
  id: number;
  clienteId: number;
  data: string;
  hora: string;
  tipo: string;
  preco: number | null;
  observacoes: string | null;
  status: string;
  cliente: {
    id: number;
    nomeCompleto: string;
  };
}

// Tipo compatível com CalendarYearWithEvents (subset de MarcacaoUtente)
interface MarcacaoCalendario {
  id: number;
  data: string;
  hora: string;
  tipo: string;
  status: string;
  cliente: {
    id: number;
    nomeCompleto: string;
  };
}

export default function CalendarioUtentePage() {
  const [selectedUtente, setSelectedUtente] = useState<Cliente | null>(null);
  const [selectedUtenteId, setSelectedUtenteId] = useState<number | undefined>(undefined);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [marcacoes, setMarcacoes] = useState<MarcacaoUtente[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateMarcacoes, setSelectedDateMarcacoes] = useState<MarcacaoUtente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Carregar clientes para o SearchableSelect
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

  // Atualizar selectedUtente quando selectedUtenteId muda
  useEffect(() => {
    if (selectedUtenteId) {
      const cliente = clientes.find((c) => c.id === selectedUtenteId);
      if (cliente) {
        setSelectedUtente(cliente);
      } else {
        // Se não encontrou na lista, buscar individualmente
        fetch(`/api/clientes/${selectedUtenteId}`)
          .then((res) => res.json())
          .then((data) => setSelectedUtente(data))
          .catch((err) => {
            console.error("Erro ao buscar utente:", err);
            setSelectedUtente(null);
          });
      }
    } else {
      setSelectedUtente(null);
    }
  }, [selectedUtenteId, clientes]);

  // Buscar marcações do utente selecionado
  useEffect(() => {
    const fetchMarcacoes = async () => {
      if (!selectedUtenteId) {
        setMarcacoes([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/marcacoes?clienteId=${selectedUtenteId}`);
        if (response.ok) {
          const data = await response.json();
          setMarcacoes(data);
        } else {
          console.error("Erro ao buscar marcações");
          setMarcacoes([]);
        }
      } catch (error) {
        console.error("Erro ao buscar marcações:", error);
        setMarcacoes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcacoes();
  }, [selectedUtenteId]);

  // Handler para clique no dia do calendário
  const handleDayClick = (date: Date, marcacoesDoDia: MarcacaoCalendario[]) => {
    // Buscar todas as marcações do dia (mesmo que só mostremos a primeira no calendário)
    const dateKey = format(date, "yyyy-MM-dd");
    const marcacoesDoDiaCompletas = marcacoes.filter((m) => {
      const marcacaoDateKey = format(new Date(m.data), "yyyy-MM-dd");
      return marcacaoDateKey === dateKey;
    });
    setSelectedDateMarcacoes(marcacoesDoDiaCompletas);
    setSelectedDate(date);
    setModalOpen(true);
  };

  // Total de marcações
  const totalMarcacoes = marcacoes.length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-text-dark">Calendário do Utente</h1>
        <p className="text-text-light mt-2">
          Visualize todas as marcações de um utente
        </p>
      </div>

      {/* Search bar */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Utente</CardTitle>
          <CardDescription>
            Digite o nome, NIF ou contacto do utente para visualizar as suas marcações
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              value={selectedUtenteId}
              onChange={(val) => setSelectedUtenteId(val as number | undefined)}
              placeholder="Pesquisar utente..."
            />
          )}
        </CardContent>
      </Card>

      {/* Resumo do utente selecionado */}
      {selectedUtente && (
        <UtenteSummary utente={selectedUtente} totalMarcacoes={totalMarcacoes} />
      )}

      {/* Calendário anual com marcações */}
      {selectedUtente ? (
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Marcações</CardTitle>
            <CardDescription>
              Clique num dia para ver as marcações detalhadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-text-light">A carregar marcações...</p>
              </div>
            ) : (
              <CalendarYearWithEvents
                year={currentYear}
                onYearChange={setCurrentYear}
                onDayClick={handleDayClick}
                marcacoes={marcacoes}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <p className="text-text-light">
              Selecione um utente para visualizar o calendário de marcações
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legenda fixa no final da página */}
      {selectedUtente && !loading && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-text-dark mb-4">Legenda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TIPOS_MARCACAO.map((tipo) => (
                <div
                  key={tipo.tipo}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tipo.cor }}
                  />
                  <span className="text-text-dark">{tipo.tipo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de marcações do dia */}
      <DayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDate}
        marcacoes={selectedDateMarcacoes}
      />
    </div>
  );
}
