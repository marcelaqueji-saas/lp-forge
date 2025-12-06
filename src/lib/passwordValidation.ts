// ============================================================
// VALIDAÇÃO DE SENHA
// ============================================================

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Requisitos mínimos: 8 caracteres, maiúscula, minúscula e número
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const validation = validatePassword(password);
  let score = 0;

  if (validation.hasMinLength) score++;
  if (validation.hasUppercase) score++;
  if (validation.hasLowercase) score++;
  if (validation.hasNumber) score++;
  if (validation.hasSpecialChar) score++;
  if (password.length >= 12) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

export const PASSWORD_REQUIREMENTS = [
  { key: 'hasMinLength', label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres` },
  { key: 'hasUppercase', label: 'Uma letra maiúscula' },
  { key: 'hasLowercase', label: 'Uma letra minúscula' },
  { key: 'hasNumber', label: 'Um número' },
] as const;
