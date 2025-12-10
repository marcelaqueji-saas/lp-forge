/**
 * InlineTextEditor - Edição inline de texto
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
  disabled?: boolean;
}

export const InlineTextEditor = ({
  value,
  onChange,
  onSave,
  placeholder = 'Clique para editar...',
  multiline = false,
  className,
  inputClassName,
  maxLength,
  disabled = false,
}: InlineTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
    onSave?.();
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <span className={cn("text-inherit", className)}>
        {value || placeholder}
      </span>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                maxLength={maxLength}
                rows={3}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border border-primary/30 bg-background/95 backdrop-blur",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "text-sm resize-none transition-all",
                  inputClassName
                )}
                placeholder={placeholder}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                maxLength={maxLength}
                className={cn(
                  "w-full px-3 py-1.5 rounded-lg border border-primary/30 bg-background/95 backdrop-blur",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "text-sm transition-all",
                  inputClassName
                )}
                placeholder={placeholder}
              />
            )}
            <div className="flex gap-1 shrink-0">
              <button
                onClick={handleSave}
                className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(true)}
            className={cn(
              "cursor-pointer hover:bg-primary/5 px-1 -mx-1 rounded transition-colors",
              "border border-transparent hover:border-primary/20",
              !value && "text-muted-foreground italic"
            )}
          >
            {value || placeholder}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
