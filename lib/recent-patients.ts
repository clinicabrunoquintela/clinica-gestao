// Utilitário para gerenciar os últimos utentes selecionados no localStorage

export interface RecentPatient {
  id: number;
  name: string;
}

const STORAGE_KEY = "recentPatients";
const MAX_RECENT = 5;

/**
 * Adiciona ou atualiza um utente na lista de recentes
 * Se já existe, move para o topo
 * Mantém máximo de 5 entradas
 */
export function addRecentPatient(patient: RecentPatient): void {
  try {
    const recent = getRecentPatients();
    
    // Remove se já existe
    const filtered = recent.filter((p) => p.id !== patient.id);
    
    // Adiciona no início
    const updated = [patient, ...filtered].slice(0, MAX_RECENT);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Erro ao salvar utente recente:", error);
  }
}

/**
 * Obtém a lista de utentes recentes
 */
export function getRecentPatients(): RecentPatient[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.slice(0, MAX_RECENT);
  } catch (error) {
    console.error("Erro ao ler utentes recentes:", error);
    return [];
  }
}

/**
 * Remove um utente da lista de recentes
 */
export function removeRecentPatient(patientId: number): void {
  try {
    const recent = getRecentPatients();
    const filtered = recent.filter((p) => p.id !== patientId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Erro ao remover utente recente:", error);
  }
}

/**
 * Limpa todos os utentes recentes
 */
export function clearRecentPatients(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar utentes recentes:", error);
  }
}

