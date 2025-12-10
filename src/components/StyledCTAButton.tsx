/**
 * StyledCTAButton - Botão CTA com suporte a variantes configuráveis
 * Usa o sistema de button variants para renderizar o estilo correto
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ButtonVariant,
  ButtonRadius,
  getButtonClasses,
  getButtonColorStyle,
} from '@/lib/buttonVariants';

interface StyledCTAButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  radius?: ButtonRadius;
  colorOverride?: string;
  href?: string;
  onClick?: () => void;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base gap-2',
  lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg gap-2',
};

export const StyledCTAButton = ({
  children,
  variant = 'primary_solid',
  radius,
  colorOverride,
  href,
  onClick,
  showArrow = true,
  size = 'md',
  className,
  disabled = false,
}: StyledCTAButtonProps) => {
  const buttonClasses = cn(
    getButtonClasses({ variant, radius }),
    SIZE_CLASSES[size],
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  const colorStyle = getButtonColorStyle(colorOverride);

  const content = (
    <>
      <span className="break-words">{children}</span>
      {showArrow && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
    </>
  );

  // Se tiver href, renderiza como link
  if (href && !disabled) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={buttonClasses}
        style={colorStyle}
      >
        {content}
      </a>
    );
  }

  // Caso contrário, renderiza como botão
  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      style={colorStyle}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default StyledCTAButton;
