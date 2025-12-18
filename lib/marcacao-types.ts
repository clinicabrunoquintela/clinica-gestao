// Tipos de marcação do sistema
export const TIPOS_MARCACAO = {
  AVALIACAO_INICIAL: "1ª Avaliação",
  CONSULTA: "Consulta",
  REAVALIACAO: "Reavaliação",
  TRATAMENTO: "Tratamento",
  MOSTRAR_EXAME: "Mostrar exame",
  DIVERSOS: "Diversos",
} as const;

// Array de tipos para uso em selects
export const TIPOS_MARCACAO_ARRAY = [
  TIPOS_MARCACAO.AVALIACAO_INICIAL,
  TIPOS_MARCACAO.CONSULTA,
  TIPOS_MARCACAO.REAVALIACAO,
  TIPOS_MARCACAO.TRATAMENTO,
  TIPOS_MARCACAO.MOSTRAR_EXAME,
  TIPOS_MARCACAO.DIVERSOS,
] as const;

export type TipoMarcacao = typeof TIPOS_MARCACAO[keyof typeof TIPOS_MARCACAO];

