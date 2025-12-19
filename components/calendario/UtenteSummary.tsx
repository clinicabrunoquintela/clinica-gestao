"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Cliente {
  id: number;
  nomeCompleto: string;
  nif?: string | null;
  telemovel?: string | null;
}

interface UtenteSummaryProps {
  utente: Cliente | null;
  totalMarcacoes: number;
}

export function UtenteSummary({ utente, totalMarcacoes }: UtenteSummaryProps) {
  const router = useRouter();

  if (!utente) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Avatar e Informações */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                {getInitials(utente.nomeCompleto)}
              </div>
            </div>

            {/* Informações */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-dark break-words">{utente.nomeCompleto}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                {utente.nif && (
                  <span className="text-sm text-text-light">NIF: {utente.nif}</span>
                )}
                {utente.telemovel && (
                  <span className="text-sm text-text-light">Tel: {utente.telemovel}</span>
                )}
              </div>
              <p className="text-sm text-text-light mt-2">
                Total de marcações: <span className="font-semibold text-text-dark">{totalMarcacoes}</span>
              </p>
            </div>
          </div>

          {/* Botão Ver Perfil */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => router.push(`/clientes/${utente.id}`)}
              className="flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Perfil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

