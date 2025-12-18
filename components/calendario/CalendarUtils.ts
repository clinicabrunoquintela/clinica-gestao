// Utilitários para o calendário do utente
import { TIPOS_MARCACAO as TIPOS_MARCACAO_CONST } from "@/lib/marcacao-types";

// Cores definidas para cada tipo de marcação
const appointmentColors: Record<string, string> = {
  "1ª Avaliação": "#FEC107",   // amarelo forte
  "Consulta": "#1EB980",       // verde
  "Reavaliação": "#E57373",    // vermelho
  "Tratamento": "#64B5F6",     // azul
  "Mostrar exame": "#FF8F00",  // laranja escuro
  "Diversos": "#B39DDB",       // roxo
};

// Mapeamento de tipo para cor (hex) - Cores atualizadas
export function getTipoColor(tipo: string): string {
  const tipoTrimmed = tipo.trim();
  
  // Verificar correspondência exata primeiro
  if (appointmentColors[tipoTrimmed]) {
    return appointmentColors[tipoTrimmed];
  }
  
  // Fallback para correspondência parcial (case-insensitive)
  const tipoLower = tipoTrimmed.toLowerCase();
  
  if (tipoLower.includes("1ª avaliação") || tipoLower.includes("primeira avaliação")) {
    return appointmentColors["1ª Avaliação"];
  }
  if (tipoLower.includes("consulta")) {
    return appointmentColors["Consulta"];
  }
  if (tipoLower.includes("reavaliação") || tipoLower.includes("reavaliacao")) {
    return appointmentColors["Reavaliação"];
  }
  if (tipoLower.includes("tratamento")) {
    return appointmentColors["Tratamento"];
  }
  if (tipoLower.includes("mostrar exame") || tipoLower.includes("exame")) {
    return appointmentColors["Mostrar exame"];
  }
  if (tipoLower.includes("diversos")) {
    return appointmentColors["Diversos"];
  }
  
  // Default: cinza
  return "#9CA3AF";
}

// Mapeamento de tipo para classe Tailwind (background)
export function getTipoBadgeClass(tipo: string): string {
  const tipoLower = tipo.toLowerCase().trim();
  
  if (tipoLower.includes("1ª avaliação") || tipoLower.includes("primeira avaliação")) {
    return "bg-yellow-200 text-yellow-900 border-yellow-300";
  }
  if (tipoLower.includes("reavaliação") || tipoLower.includes("reavaliacao")) {
    return "bg-red-200 text-red-900 border-red-300";
  }
  if (tipoLower.includes("mostrar exame") || tipoLower.includes("exame")) {
    return "bg-amber-200 text-amber-900 border-amber-300";
  }
  if (tipoLower.includes("consulta")) {
    return "bg-green-200 text-green-900 border-green-300";
  }
  if (tipoLower.includes("tratamento")) {
    return "bg-blue-200 text-blue-900 border-blue-300";
  }
  if (tipoLower.includes("diversos")) {
    return "bg-purple-200 text-purple-900 border-purple-300";
  }
  
  // Default: cinza
  return "bg-gray-200 text-gray-900 border-gray-300";
}

// Lista de tipos para a legenda - Cores atualizadas
export const TIPOS_MARCACAO: { tipo: string; cor: string; classe: string }[] = [
  { tipo: TIPOS_MARCACAO_CONST.AVALIACAO_INICIAL, cor: appointmentColors["1ª Avaliação"], classe: "bg-yellow-200 text-yellow-900 border-yellow-300" },
  { tipo: TIPOS_MARCACAO_CONST.CONSULTA, cor: appointmentColors["Consulta"], classe: "bg-green-200 text-green-900 border-green-300" },
  { tipo: TIPOS_MARCACAO_CONST.REAVALIACAO, cor: appointmentColors["Reavaliação"], classe: "bg-red-200 text-red-900 border-red-300" },
  { tipo: TIPOS_MARCACAO_CONST.TRATAMENTO, cor: appointmentColors["Tratamento"], classe: "bg-blue-200 text-blue-900 border-blue-300" },
  { tipo: TIPOS_MARCACAO_CONST.MOSTRAR_EXAME, cor: appointmentColors["Mostrar exame"], classe: "bg-amber-200 text-amber-900 border-amber-300" },
  { tipo: TIPOS_MARCACAO_CONST.DIVERSOS, cor: appointmentColors["Diversos"], classe: "bg-purple-200 text-purple-900 border-purple-300" },
];

