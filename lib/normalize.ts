// Função utilitária para normalizar strings removendo acentos (apenas para comparação)
export function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

