import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AnimationPreset, 
  CursorEffect, 
  prefersReducedMotion 
} from '@/lib/premiumPresets';

// ============================================================
// ANIMATION WRAPPER
// ============================================================

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationPreset;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className,
  disabled = false,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const reducedMotion = prefersReducedMotion();

  if (disabled || reducedMotion || animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    hidden: getInitialState(animation),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function getInitialState(animation: AnimationPreset) {
  switch (animation) {
    case 'fade-up':
      return { opacity: 0, y: 30 };
    case 'fade-left':
      return { opacity: 0, x: 30 };
    case 'fade-right':
      return { opacity: 0, x: -30 };
    case 'scale-in':
      return { opacity: 0, scale: 0.95 };
    case 'float':
      return { opacity: 0, y: 20 };
    default:
      return { opacity: 0 };
  }
}

// ============================================================
// TILT CARD
// ============================================================

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  disabled?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  intensity = 10,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reducedMotion = prefersReducedMotion();

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (disabled || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn('transition-shadow', className)}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// SPOTLIGHT CARD
// ============================================================

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reducedMotion = prefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (disabled || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn('relative overflow-hidden', className)}
      style={{
        '--spotlight-x': `${position.x}px`,
        '--spotlight-y': `${position.y}px`,
      } as React.CSSProperties}
    >
      <div className="premium-spotlight-effect absolute inset-0 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100" />
      {children}
    </div>
  );
};

// ============================================================
// MAGNETIC ELEMENT
// ============================================================

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}

export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  className,
  strength = 0.3,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reducedMotion = prefersReducedMotion();

  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled || reducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (disabled || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// FLOATING ORBS
// ============================================================

interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
  className?: string;
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  count = 3,
  colors = ['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)'],
  className,
}) => {
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) return null;

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            background: colors[i % colors.length],
            left: `${20 + i * 25}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================
// MORPHING BLOBS
// ============================================================

interface MorphingBlobsProps {
  className?: string;
}

export const MorphingBlobs: React.FC<MorphingBlobsProps> = ({ className }) => {
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) return null;

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className="premium-blob premium-blob-1" />
      <div className="premium-blob premium-blob-2" />
      <div className="premium-blob premium-blob-3" />
    </div>
  );
};

// ============================================================
// SECTION SEPARATOR
// ============================================================

interface SectionSeparatorProps {
  type: 'line' | 'gradient' | 'glow' | 'wave' | 'diagonal' | 'curve';
  position?: 'top' | 'bottom';
  className?: string;
}

export const SectionSeparator: React.FC<SectionSeparatorProps> = ({
  type,
  position = 'bottom',
  className,
}) => {
  const isTop = position === 'top';

  const renderSeparator = () => {
    switch (type) {
      case 'line':
        return (
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        );
      case 'gradient':
        return (
          <div className="w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
        );
      case 'glow':
        return (
          <div className="w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 blur-sm" />
        );
      case 'wave':
        return (
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className={cn('w-full h-12', isTop && 'rotate-180')}
          >
            <path
              d="M0,30 C300,60 600,0 900,30 C1050,45 1150,15 1200,30 L1200,60 L0,60 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        );
      case 'diagonal':
        return (
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className={cn('w-full h-16', isTop && 'rotate-180')}
          >
            <polygon points="0,10 100,0 100,10" fill="currentColor" className="text-background" />
          </svg>
        );
      case 'curve':
        return (
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            className={cn('w-full h-12', isTop && 'rotate-180')}
          >
            <path
              d="M0,60 Q600,0 1200,60 L1200,60 L0,60 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'absolute left-0 right-0 z-10',
        isTop ? 'top-0' : 'bottom-0',
        className
      )}
    >
      {renderSeparator()}
    </div>
  );
};

// ============================================================
// CURSOR EFFECT WRAPPER
// ============================================================

interface CursorEffectWrapperProps {
  children: ReactNode;
  effect: CursorEffect;
  className?: string;
  disabled?: boolean;
}

export const CursorEffectWrapper: React.FC<CursorEffectWrapperProps> = ({
  children,
  effect,
  className,
  disabled = false,
}) => {
  if (disabled || effect === 'none') {
    return <div className={className}>{children}</div>;
  }

  switch (effect) {
    case 'tilt':
      return <TiltCard className={className}>{children}</TiltCard>;
    case 'spotlight':
      return <SpotlightCard className={className}>{children}</SpotlightCard>;
    case 'magnetic':
      return <MagneticElement className={className}>{children}</MagneticElement>;
    default:
      return <div className={className}>{children}</div>;
  }
};
