"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/components/ui/use-toast";

interface Cliente {
  id: number;
  nomeCompleto: string;
  email: string | null;
  telemovel: string | null;
  _count: {
    marcacoes: number;
  };
}

export default function ClientesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Buscar todos os clientes uma vez
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/clientes");
        if (response.ok) {
          const data = await response.json();
          setAllClientes(data);
        }
      } catch (error) {
        console.error("Erro ao buscar utentes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Verificar se há parâmetro de criação bem-sucedida
  useEffect(() => {
    const created = searchParams.get("created");
    if (created === "true") {
      // Recarregar lista de clientes
      fetch("/api/clientes")
        .then((res) => res.json())
        .then((data) => {
          setAllClientes(data);
        })
        .catch((err) => {
          console.error("Erro ao recarregar utentes:", err);
        });
      
      // Mostrar toast de sucesso
      toast({
        variant: "success",
        title: "Utente criado!",
        description: "O utente foi adicionado com sucesso.",
      });

      // Limpar parâmetro do URL
      router.replace("/clientes");
    }
  }, [searchParams, toast, router]);

  // Filtrar clientes baseado na seleção (se houver)
  // Se não houver seleção, mostrar todos
  const clientes = useMemo(() => {
    if (!selectedClienteId) {
      return allClientes;
    }
    return allClientes.filter((c) => c.id === selectedClienteId);
  }, [allClientes, selectedClienteId]);

  // Calcular número de itens por página baseado na altura disponível
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!containerRef.current || !listRef.current) return;

      const viewportHeight = window.innerHeight;
      
      // Medir posição do container da lista
      const listRect = listRef.current.getBoundingClientRect();
      const listTop = listRect.top;
      
      // Altura disponível = viewport - posição da lista - espaço para paginação - margem de segurança
      const paginationHeight = 60; // Altura dos controles de paginação
      const bottomMargin = 40; // Margem de segurança
      const availableHeight = viewportHeight - listTop - paginationHeight - bottomMargin;

      // Altura estimada de um item (incluindo gap)
      // Cada item tem p-4 (16px top + 16px bottom = 32px) + conteúdo (~50px) + gap (16px do space-y-4)
      const itemHeight = 82; // ~82px por item (incluindo gap)

      // Calcular quantos itens cabem
      const calculatedItems = Math.floor(availableHeight / itemHeight);
      
      // Garantir mínimo de 3 e máximo de 20 itens
      const finalItems = Math.max(3, Math.min(calculatedItems, 20));
      
      if (finalItems > 0) {
        setItemsPerPage((prev) => {
          // Só atualizar se mudou significativamente (evitar loops)
          return Math.abs(prev - finalItems) > 1 ? finalItems : prev;
        });
      }
    };

    // Calcular inicialmente após carregar e quando a lista mudar
    if (!loading && clientes.length > 0) {
      // Usar requestAnimationFrame para garantir que o DOM está renderizado
      requestAnimationFrame(() => {
        setTimeout(calculateItemsPerPage, 50);
      });
    }

    // Recalcular ao redimensionar
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, [loading, clientes.length]);

  // Resetar página quando filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClienteId]);

  // Calcular paginação
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClientes = clientes.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div ref={containerRef} className="space-y-4 md:space-y-6">
      <div ref={headerRef} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Utentes</h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Gerencie seus utentes</p>
        </div>
        <Link href="/clientes/novo" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Ficha
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Utentes</CardTitle>
              <CardDescription>
                {loading
                  ? "A carregar..."
                  : `${clientes.length} ${clientes.length === 1 ? "utente cadastrado" : "utentes cadastrados"}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SearchableSelect
                  variant="utente"
                  options={allClientes.map((c) => ({
                    value: c.id,
                    label: `${c.nomeCompleto} — ${c.telemovel || "sem telefone"}`,
                  }))}
                  value={selectedClienteId}
                  onChange={(val) => setSelectedClienteId(val as number | undefined)}
                  placeholder="Buscar utente..."
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">A carregar utentes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">Nenhum utente cadastrado.</p>
            </div>
          ) : (
            <>
              <div ref={listRef} className="space-y-3 md:space-y-4">
                {paginatedClientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors gap-3 md:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base md:text-base">{cliente.nomeCompleto}</p>
                      <p className="text-sm text-text-light mt-1">
                        {[cliente.email, cliente.telemovel]
                          .filter(Boolean)
                          .join(" | ") || "Sem contacto"}
                        {cliente._count.marcacoes > 0 && (
                          <span className="ml-2">
                            • {cliente._count.marcacoes}{" "}
                            {cliente._count.marcacoes === 1
                              ? "marcação"
                              : "marcações"}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/clientes/${cliente.id}`)}
                      className="w-full md:w-auto"
                    >
                      Consultar Ficha
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Controles de paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-border gap-4">
                  <div className="text-sm text-text-light text-center md:text-left">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, clientes.length)} de {clientes.length} utentes
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex-1 md:flex-initial"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <div className="text-sm text-text-dark px-3 whitespace-nowrap">
                      Página {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex-1 md:flex-initial"
                    >
                      Seguinte
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

