/**
 * WhatsAppFloatingButton - Botão flutuante de WhatsApp
 * Configurável por LP via lp_settings
 */

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface WhatsAppConfig {
  whatsapp_enabled?: string;
  whatsapp_phone?: string;
  whatsapp_default_message?: string;
  whatsapp_position?: 'bottom_right' | 'bottom_left';
}

interface WhatsAppFloatingButtonProps {
  settings: WhatsAppConfig;
  className?: string;
}

export const WhatsAppFloatingButton = ({ 
  settings, 
  className 
}: WhatsAppFloatingButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Verifica se está habilitado
  const isEnabled = settings.whatsapp_enabled === 'true';
  const phone = settings.whatsapp_phone?.replace(/\D/g, ''); // Remove não-numéricos
  const message = settings.whatsapp_default_message || '';
  const position = settings.whatsapp_position || 'bottom_right';

  // Delay para mostrar o botão
  useEffect(() => {
    if (isEnabled && phone) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, phone]);

  // Esconde tooltip após alguns segundos
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  if (!isEnabled || !phone) return null;

  const whatsappUrl = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  const positionClasses = position === 'bottom_left'
    ? 'left-4 sm:left-6'
    : 'right-4 sm:right-6';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed bottom-4 sm:bottom-6 z-50',
            positionClasses,
            className
          )}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: position === 'bottom_left' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: position === 'bottom_left' ? -10 : 10 }}
                className={cn(
                  'absolute bottom-full mb-3 px-3 py-2 bg-card rounded-lg shadow-lg border',
                  'text-sm text-foreground whitespace-nowrap',
                  position === 'bottom_left' ? 'left-0' : 'right-0'
                )}
              >
                <button 
                  onClick={() => setShowTooltip(false)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-muted rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <span>💬 Fale conosco pelo WhatsApp!</span>
                {/* Arrow */}
                <div 
                  className={cn(
                    'absolute top-full w-3 h-3 bg-card border-b border-r transform rotate-45 -translate-y-1.5',
                    position === 'bottom_left' ? 'left-6' : 'right-6'
                  )} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão principal */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center',
              'w-14 h-14 sm:w-16 sm:h-16 rounded-full',
              'bg-[#25D366] hover:bg-[#20BA5C] text-white',
              'shadow-lg hover:shadow-xl transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'touch-manipulation'
            )}
            aria-label="Falar pelo WhatsApp"
          >
            <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" />
          </a>

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppFloatingButton;
