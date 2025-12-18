"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Cake, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Aniversariante {
  id: number;
  nomeCompleto: string;
  idade: number;
  telemovel: string | null;
}

interface AniversariosData {
  total: number;
  aniversariantes: Aniversariante[];
}

export function AniversariosPopover() {
  const router = useRouter();
  const [aniversarios, setAniversarios] = useState<AniversariosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAniversarios = async () => {
      try {
        const response = await fetch("/api/aniversarios");
        if (response.ok) {
          const data = await response.json();
          setAniversarios(data);
        }
      } catch (error) {
        console.error("Erro ao buscar aniversários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAniversarios();
    // Atualizar a cada minuto
    const interval = setInterval(fetchAniversarios, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Cake className="h-5 w-5 md:h-6 md:w-6" />
          {aniversarios && aniversarios.total > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {aniversarios.total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 min-w-[260px] rounded-md shadow-md" align="end">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
          <Cake className="text-[#F28C1D] h-4 w-4 flex-shrink-0" />
          <span className="font-semibold text-neutral-900">Aniversários do Dia</span>
        </div>

        {/* Body */}
        <div className="py-2">
          {loading ? (
            <div className="p-6 text-center text-sm text-text-light">
              A carregar...
            </div>
          ) : aniversarios && aniversarios.total > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {aniversarios.aniversariantes.map((aniversariante) => (
                <div
                  key={aniversariante.id}
                  onClick={() => {
                    router.push(`/clientes/${aniversariante.id}`);
                    setOpen(false);
                  }}
                  className="p-3 border-b last:border-b-0 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-800 mb-1">
                        {aniversariante.nomeCompleto}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {aniversariante.telemovel || "Sem contacto"}
                        </span>
                      </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      {aniversariante.idade} {aniversariante.idade === 1 ? "ano" : "anos"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-text-light">
              Nenhum aniversário hoje 🎉
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-neutral-200" />

        {/* Footer */}
        <div className="py-3 px-1">
          <p className="text-xs text-neutral-500 text-center">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
