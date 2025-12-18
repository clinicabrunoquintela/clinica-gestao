"use client";

import * as React from "react";
import { ChevronDown, X, Search, User, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { addRecentPatient, getRecentPatients, type RecentPatient } from "@/lib/recent-patients";
import { normalize } from "@/lib/normalize";

interface SearchableSelectOption {
  label: string;
  value: string | number;
}

interface SearchableSelectProps {
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  variant?: "utente" | "default";
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção...",
  disabled = false,
  variant = "default",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [recentPatients, setRecentPatients] = React.useState<RecentPatient[]>([]);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Carregar utentes recentes quando variant="utente"
  React.useEffect(() => {
    if (variant === "utente") {
      setRecentPatients(getRecentPatients());
    }
  }, [variant]);

  // Parse label para separar nome e telefone (formato: "Nome — Telefone")
  const parseLabel = (label: string) => {
    const parts = label.split(" — ");
    return {
      nome: parts[0] || label,
      telefone: parts[1] || null,
    };
  };

  // Filtrar opções apenas se variant="utente" e searchTerm existe
  const filteredOptions = React.useMemo(() => {
    if (variant !== "utente") return options;
    
    // Se não há termo de busca, retornar todas as opções (os recentes serão mostrados separadamente)
    if (!searchTerm) return options;
    
    // Normalizar apenas na comparação, não alterar o searchTerm
    const normalizedSearchTerm = normalize(searchTerm);
    return options.filter((option) =>
      normalize(option.label).includes(normalizedSearchTerm)
    );
  }, [options, searchTerm, variant]);

  // Fechar ao clicar fora
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
      if (variant === "utente") {
        setTimeout(() => {
          inputRef.current?.focus();
          setIsInputFocused(true);
        }, 0);
      }
    } else {
      setIsInputFocused(false);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, variant]);

  // Fechar ao pressionar Escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    // Se variant="utente", salvar no localStorage
    if (variant === "utente") {
      const selected = options.find((opt) => opt.value === optionValue);
      if (selected) {
        const { nome } = parseLabel(selected.label);
        addRecentPatient({
          id: optionValue as number,
          name: nome,
        });
        setRecentPatients(getRecentPatients());
      }
    }
    
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSelectRecent = (recent: RecentPatient) => {
    // Buscar a opção correspondente
    const matchingOption = options.find((opt) => opt.value === recent.id);
    if (matchingOption) {
      handleSelect(recent.id);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm flex items-center justify-between",
          "hover:border-neutral-400 transition-all",
          "focus:ring-2 focus:ring-orange-300 focus:border-orange-400",
          isOpen && "ring-2 ring-orange-300 border-orange-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "flex-1 text-left",
            selectedOption ? "text-neutral-700" : "text-neutral-400"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {selectedOption && !disabled && (
            <button
              onClick={handleClear}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-0.5 hover:bg-neutral-100 rounded transition-colors"
              aria-label="Limpar seleção"
            >
              <X className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-[9999] rounded-md border border-neutral-200 bg-white shadow-md overflow-hidden">
          {/* Campo de busca - apenas se variant="utente" */}
          {variant === "utente" && (
            <div className="p-2 border-b border-neutral-200 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => {
                    // Delay para permitir clique nos itens
                    setTimeout(() => setIsInputFocused(false), 200);
                  }}
                  placeholder="Procurar utente..."
                  className="w-full h-9 pl-8 pr-2 rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Lista de opções */}
          <div className={cn("overflow-y-auto", variant === "utente" ? "max-h-56" : "max-h-64")}>
            {/* Mostrar utentes recentes quando variant="utente" e searchTerm está vazio */}
            {variant === "utente" && !searchTerm && recentPatients.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase border-b border-neutral-200">
                  Últimos selecionados
                </div>
                {recentPatients.map((recent) => {
                  const matchingOption = options.find((opt) => opt.value === recent.id);
                  if (!matchingOption) return null; // Se não existe mais nas opções, não mostrar
                  
                  return (
                    <button
                      key={recent.id}
                      type="button"
                      onClick={() => handleSelectRecent(recent)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectRecent(recent);
                      }}
                      className={cn(
                        "w-full text-left transition-colors cursor-pointer flex items-center gap-3 px-3 py-2 hover:bg-orange-50",
                        value === recent.id && "bg-orange-100"
                      )}
                    >
                      <Clock className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <div className="flex flex-col leading-tight flex-1">
                        <span className="text-sm font-medium text-neutral-800">{recent.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Mostrar resultados da pesquisa apenas quando há searchTerm */}
            {searchTerm && (
              <>
                {filteredOptions.length === 0 ? (
                  <div className="py-3 text-center text-neutral-500 text-sm">
                    {variant === "utente" ? "Nenhum utente encontrado" : "Nenhuma opção disponível"}
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                const isSelected = option.value === value;

                if (variant === "utente") {
                  const { nome, telefone } = parseLabel(option.label);
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(option.value);
                      }}
                      className={cn(
                        "w-full text-left transition-colors cursor-pointer flex items-center gap-3 px-3 py-2 hover:bg-orange-50",
                        isSelected && "bg-orange-100"
                      )}
                    >
                      <User className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <div className="flex flex-col leading-tight flex-1">
                        <span className="text-sm font-medium text-neutral-800">{nome}</span>
                        {telefone && (
                          <span className="text-xs text-neutral-400 mt-0.5">{telefone}</span>
                        )}
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                    data-selected={isSelected}
                    className={cn(
                      "w-full h-10 px-3 flex items-center justify-between cursor-pointer transition-colors rounded-md",
                      "hover:bg-orange-50",
                      isSelected && "bg-orange-100"
                    )}
                  >
                    <span className="text-sm font-medium text-neutral-800">
                      {option.label}
                    </span>

                    {isSelected && (
                      <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
                  </button>
                );
                  })
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
