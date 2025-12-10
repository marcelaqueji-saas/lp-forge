// Section Separator Component
// Renders visual separators between LP sections

import { cn } from '@/lib/utils';

export type SeparatorType = 'wave' | 'diagonal' | 'zigzag' | 'glass' | 'curve' | 'triangle' | 'steps' | 'none';

interface SectionSeparatorProps {
  type: SeparatorType;
  position?: 'top' | 'bottom';
  color?: string;
  className?: string;
  flip?: boolean;
}

const WaveSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-16 md:h-24", flip && "rotate-180")}
    fill={color}
  >
    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
  </svg>
);

const DiagonalSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-16 md:h-24", flip && "rotate-180")}
    fill={color}
  >
    <polygon points="1200 0 1200 120 0 120" />
  </svg>
);

const ZigzagSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-12 md:h-16", flip && "rotate-180")}
    fill={color}
  >
    <path d="M0,0 L100,60 L200,0 L300,60 L400,0 L500,60 L600,0 L700,60 L800,0 L900,60 L1000,0 L1100,60 L1200,0 L1200,120 L0,120 Z" />
  </svg>
);

const CurveSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-16 md:h-24", flip && "rotate-180")}
    fill={color}
  >
    <path d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z" />
  </svg>
);

const TriangleSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-16 md:h-20", flip && "rotate-180")}
    fill={color}
  >
    <polygon points="600,0 1200,120 0,120" />
  </svg>
);

const StepsSVG = ({ color = 'currentColor', flip }: { color?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className={cn("w-full h-12 md:h-16", flip && "rotate-180")}
    fill={color}
  >
    <path d="M0,0 L0,40 L300,40 L300,80 L600,80 L600,40 L900,40 L900,80 L1200,80 L1200,0 Z" />
  </svg>
);

const GlassSeparator = ({ flip }: { flip?: boolean }) => (
  <div className={cn(
    "w-full h-16 md:h-24 relative overflow-hidden",
    flip && "rotate-180"
  )}>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10 backdrop-blur-sm" />
    <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  </div>
);

export const SectionSeparator = ({
  type,
  position = 'bottom',
  color = 'hsl(var(--background))',
  className,
  flip = false,
}: SectionSeparatorProps) => {
  if (type === 'none') return null;

  const shouldFlip = position === 'top' ? !flip : flip;

  const renderSeparator = () => {
    switch (type) {
      case 'wave':
        return <WaveSVG color={color} flip={shouldFlip} />;
      case 'diagonal':
        return <DiagonalSVG color={color} flip={shouldFlip} />;
      case 'zigzag':
        return <ZigzagSVG color={color} flip={shouldFlip} />;
      case 'curve':
        return <CurveSVG color={color} flip={shouldFlip} />;
      case 'triangle':
        return <TriangleSVG color={color} flip={shouldFlip} />;
      case 'steps':
        return <StepsSVG color={color} flip={shouldFlip} />;
      case 'glass':
        return <GlassSeparator flip={shouldFlip} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "w-full overflow-hidden leading-[0] pointer-events-none select-none",
        position === 'top' && "-mb-px",
        position === 'bottom' && "-mt-px",
        className
      )}
      aria-hidden="true"
    >
      {renderSeparator()}
    </div>
  );
};

// Separator catalog for picker
export const SEPARATOR_CATALOG: {
  id: SeparatorType;
  name: string;
  description: string;
  plan: 'free' | 'pro' | 'premium';
  preview: React.ReactNode;
}[] = [
  {
    id: 'none',
    name: 'Sem separador',
    description: 'Sem divisor entre seções',
    plan: 'free',
    preview: <div className="w-full h-8 bg-muted/50" />,
  },
  {
    id: 'wave',
    name: 'Onda',
    description: 'Transição suave em forma de onda',
    plan: 'free',
    preview: <WaveSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    description: 'Corte diagonal clean',
    plan: 'free',
    preview: <DiagonalSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'curve',
    name: 'Curva suave',
    description: 'Arco elegante',
    plan: 'pro',
    preview: <CurveSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'triangle',
    name: 'Triângulo',
    description: 'Ponta triangular central',
    plan: 'pro',
    preview: <TriangleSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'zigzag',
    name: 'Zig-Zag',
    description: 'Padrão em zigue-zague',
    plan: 'pro',
    preview: <ZigzagSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'steps',
    name: 'Degraus',
    description: 'Estilo escada',
    plan: 'premium',
    preview: <StepsSVG color="hsl(var(--muted))" />,
  },
  {
    id: 'glass',
    name: 'Glass blur',
    description: 'Gradiente glass com blur',
    plan: 'premium',
    preview: <div className="w-full h-8 bg-gradient-to-b from-transparent to-primary/10" />,
  },
];

export default SectionSeparator;
