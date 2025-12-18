"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { addRecentPatient, getRecentPatients, type RecentPatient } from "@/lib/recent-patients";
import { normalize } from "@/lib/normalize";

interface Cliente {
  id: number;
  nomeCompleto: string;
  nif?: string | null;
  telemovel?: string | null;
}

interface UtenteSearchProps {
  onSelectUtente: (utente: Cliente | null) => void;
  selectedUtente: Cliente | null;
}

export function UtenteSearch({ onSelectUtente, selectedUtente }: UtenteSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Cliente[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar utentes recentes
  useEffect(() => {
    setRecentPatients(getRecentPatients());
  }, []);

  // Debounce da pesquisa
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se o campo está vazio e focado, mostrar utentes recentes
    if (searchQuery.trim().length === 0 && isFocused) {
      setResults([]);
      setIsOpen(true);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/clientes?search=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          
          // Filtrar resultados no frontend usando normalização APENAS na comparação
          const searchTerm = searchQuery.trim();
          const normalizedSearchTerm = normalize(searchTerm);
          
          const filteredResults = data.filter((utente: Cliente) => {
            return (
              normalize(utente.nomeCompleto || "").includes(normalizedSearchTerm) ||
              normalize(utente.telemovel || "").includes(normalizedSearchTerm) ||
              normalize(utente.nif || "").includes(normalizedSearchTerm)
            );
          });
          
          setResults(filteredResults.slice(0, 10)); // Limitar a 10 resultados
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar utentes:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isFocused]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (utente: Cliente) => {
    // Salvar no localStorage
    addRecentPatient({
      id: utente.id,
      name: utente.nomeCompleto,
    });
    // Atualizar lista de recentes
    setRecentPatients(getRecentPatients());
    
    onSelectUtente(utente);
    setSearchQuery(utente.nomeCompleto);
    setIsOpen(false);
  };

  const handleSelectRecent = async (recent: RecentPatient) => {
    // Buscar dados completos do utente
    try {
      const response = await fetch(`/api/clientes/${recent.id}`);
      if (response.ok) {
        const utente = await response.json();
        handleSelect({
          id: utente.id,
          nomeCompleto: utente.nomeCompleto,
          nif: utente.nif,
          telemovel: utente.telemovel,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar utente:", error);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setIsOpen(false);
    onSelectUtente(null);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light" />
        <Input
          type="text"
          placeholder="Pesquisar utente..."
          value={searchQuery}
          onChange={(e) => {
            // NÃO normalizar o input - permitir acentos normalmente
            setSearchQuery(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (searchQuery.trim().length === 0) {
              setIsOpen(true);
            } else if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay para permitir clique nos itens do dropdown
            setTimeout(() => setIsOpen(false), 200);
          }}
          className="pl-10 pr-10"
          aria-label="Pesquisar utente"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark"
            aria-label="Limpar pesquisa"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-text-light">A carregar...</div>
          ) : searchQuery.trim().length === 0 && recentPatients.length > 0 ? (
            // Mostrar utentes recentes quando o campo está vazio
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-text-light uppercase border-b border-gray-200">
                Últimos selecionados
              </div>
              <ul role="listbox" className="py-1">
                {recentPatients.map((recent) => (
                  <li
                    key={recent.id}
                    role="option"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevenir blur do input
                      handleSelectRecent(recent);
                    }}
                    className={cn(
                      "px-4 py-2 cursor-pointer hover:bg-accent/50 flex items-center gap-2",
                      selectedUtente?.id === recent.id && "bg-accent"
                    )}
                  >
                    <Clock className="h-4 w-4 text-text-light" />
                    <div className="font-medium text-text-dark">{recent.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-text-light">Nenhum utente encontrado</div>
          ) : (
            <ul role="listbox" className="py-1">
              {results.map((utente) => (
                <li
                  key={utente.id}
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevenir blur do input
                    handleSelect(utente);
                  }}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-accent/50 flex items-center gap-2",
                    selectedUtente?.id === utente.id && "bg-accent"
                  )}
                >
                  <User className="h-4 w-4 text-text-light" />
                  <div className="font-medium text-text-dark">{utente.nomeCompleto}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

