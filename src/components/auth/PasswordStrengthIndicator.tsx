import { Check, X } from 'lucide-react';
import { 
  validatePassword, 
  PASSWORD_REQUIREMENTS,
  PasswordValidation 
} from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  className 
}: PasswordStrengthIndicatorProps) => {
  const validation = validatePassword(password);

  if (!password) return null;

  return (
    <div className={cn("space-y-2 mt-2", className)}>
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => {
          const filledCount = Object.values(validation).filter(Boolean).length - 1; // -1 for isValid
          const isFilled = i < filledCount;
          return (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                isFilled
                  ? filledCount <= 2
                    ? "bg-destructive"
                    : filledCount === 3
                    ? "bg-warning"
                    : "bg-success"
                  : "bg-muted"
              )}
            />
          );
        })}
      </div>
      
      <ul className="space-y-1">
        {PASSWORD_REQUIREMENTS.map(({ key, label }) => {
          const isValid = validation[key as keyof PasswordValidation];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                isValid ? "text-success" : "text-muted-foreground"
              )}
            >
              {isValid ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
