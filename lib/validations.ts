/**
 * Validação de email
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validação de telefone português
 * Aceita formatos: +351 912 345 678, 912345678, 351912345678, etc.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === "") return false;
  // Remove espaços, hífens e parênteses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Remove o prefixo +351 se existir
  const withoutPrefix = cleaned.startsWith("+351") 
    ? cleaned.slice(4) 
    : cleaned.startsWith("351") 
    ? cleaned.slice(3) 
    : cleaned;
  // Deve ter 9 dígitos (formato português)
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(withoutPrefix);
}

/**
 * Normaliza telefone para formato padrão
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const withoutPrefix = cleaned.startsWith("+351") 
    ? cleaned.slice(4) 
    : cleaned.startsWith("351") 
    ? cleaned.slice(3) 
    : cleaned;
  return `+351 ${withoutPrefix.slice(0, 3)} ${withoutPrefix.slice(3, 6)} ${withoutPrefix.slice(6)}`;
}

/**
 * Valida dados do cliente
 */
export function validateCliente(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Nome completo é obrigatório
  if (!data.nomeCompleto || data.nomeCompleto.trim() === "") {
    errors.push("Nome completo é obrigatório");
  }

  // Valida email se fornecido
  if (data.email && data.email.trim() !== "") {
    if (!isValidEmail(data.email)) {
      errors.push("Email inválido");
    }
  }

  // Valida telefone se fornecido
  if (data.telemovel && data.telemovel.trim() !== "") {
    if (!isValidPhone(data.telemovel)) {
      errors.push("Telemóvel inválido. Use o formato: +351 912 345 678");
    }
  }

  // Valida data de nascimento se fornecido
  if (data.dataNascimento) {
    const date = new Date(data.dataNascimento);
    if (isNaN(date.getTime())) {
      errors.push("Data de nascimento inválida");
    } else if (date > new Date()) {
      errors.push("Data de nascimento não pode ser no futuro");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

