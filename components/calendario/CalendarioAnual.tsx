"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarioAnualProps {
  year?: number;
}

// Função para calcular a Páscoa (algoritmo de Meeus/Jones/Butcher)
function calcularPascoa(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Função para obter feriados fixos e móveis
function getFeriados(year: number): Set<string> {
  const feriados = new Set<string>();
  
  // Feriados fixos
  const fixos = [
    `${year}-01-01`, // Ano Novo
    `${year}-04-25`, // Dia da Liberdade
    `${year}-05-01`, // Dia do Trabalhador
    `${year}-06-10`, // Dia de Portugal
    `${year}-08-15`, // Assunção de Nossa Senhora
    `${year}-10-05`, // Implantação da República
    `${year}-11-01`, // Todos os Santos
    `${year}-12-01`, // Restauração da Independência
    `${year}-12-08`, // Imaculada Conceição
    `${year}-12-25`, // Natal
  ];
  
  fixos.forEach(f => feriados.add(f));
  
  // Feriados móveis (baseados na Páscoa)
  const pascoa = calcularPascoa(year);
  const sextaSanta = addDays(pascoa, -2);
  const corpoDeus = addDays(pascoa, 60);
  
  feriados.add(format(sextaSanta, "yyyy-MM-dd"));
  feriados.add(format(corpoDeus, "yyyy-MM-dd"));
  
  return feriados;
}

export function CalendarioAnual({ year = new Date().getFullYear() }: CalendarioAnualProps) {
  const router = useRouter();
  const hoje = new Date();
  const feriados = useMemo(() => getFeriados(year), [year]);

  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes = new Date(year, i, 1);
    return {
      mes,
      nome: format(mes, "MMMM", { locale: ptBR }),
    };
  });

  const getDiasDoMes = (mes: Date) => {
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);
    const inicioSemana = startOfWeek(inicioMes, { weekStartsOn: 1 }); // Segunda-feira
    const fimSemana = endOfWeek(fimMes, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: inicioSemana, end: fimSemana });
  };

  const isFeriado = (data: Date) => {
    return feriados.has(format(data, "yyyy-MM-dd"));
  };

  const isHoje = (data: Date) => {
    return isSameDay(data, hoje);
  };

  const handleDayClick = (data: Date) => {
    const dataFormatada = format(data, "yyyy-MM-dd");
    router.push(`/calendario/${dataFormatada}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-dark mb-2">Vista Anual {year}</h2>
        <p className="text-text-light">Clique num dia para ver as marcações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meses.map(({ mes, nome }) => {
          const dias = getDiasDoMes(mes);
          const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);

          return (
            <div
              key={nome}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
            >
              {/* Cabeçalho do mês */}
              <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#F97316] rounded-full" />
                  <h3 className="font-semibold text-neutral-900 text-base">
                    {nomeCapitalizado}
                  </h3>
                </div>
              </div>

              {/* Grelha de dias */}
              <div className="p-3">
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => (
                    <div
                      key={dia}
                      className="text-xs font-medium text-neutral-500 text-center py-1"
                    >
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                  {dias.map((dia, index) => {
                    const diaFormatado = format(dia, "yyyy-MM-dd");
                    const isMesAtual = isSameMonth(dia, mes);
                    const isFeriadoDia = isFeriado(dia);
                    const isHojeDia = isHoje(dia);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayClick(dia)}
                        disabled={!isMesAtual}
                        className={cn(
                          "aspect-square text-xs font-medium rounded-md transition-colors",
                          "hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300",
                          !isMesAtual && "text-neutral-300 cursor-not-allowed",
                          isMesAtual && !isFeriadoDia && !isHojeDia && "text-neutral-700 hover:bg-neutral-100",
                          isFeriadoDia && !isHojeDia && "text-[#F87171] font-semibold",
                          isHojeDia && "bg-[#F97316] text-white font-semibold hover:bg-[#EA6820]"
                        )}
                      >
                        {format(dia, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
