import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SeparatorType = 'wave' | 'diagonal' | 'zigzag' | 'glass';

interface SectionSeparatorProps {
  type?: SeparatorType;
  position?: 'top' | 'bottom';
  color?: string;
  height?: number;
  flip?: boolean;
  disableAnimations?: boolean;
}

export const SectionSeparator = ({
  type = 'wave',
  position = 'bottom',
  color = 'hsl(var(--background))',
  height = 100,
  flip = false,
  disableAnimations = false,
}: SectionSeparatorProps) => {
  const isTop = position === 'top';

  const renderSeparator = () => {
    switch (type) {
      case 'wave':
        return (
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full"
            style={{ height }}
          >
            {disableAnimations ? (
              <path
                d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
                fill={color}
              />
            ) : (
              <motion.path
                d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
                fill={color}
                animate={{
                  d: [
                    'M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z',
                    'M0,40 C200,80 400,40 600,80 C800,40 1000,80 1200,40 L1200,120 L0,120 Z',
                    'M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z',
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </svg>
        );

      case 'diagonal':
        return (
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full"
            style={{ height }}
          >
            <polygon points="0,0 1200,120 0,120" fill={color} />
          </svg>
        );

      case 'zigzag':
        return (
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full"
            style={{ height }}
          >
            <path
              d="M0,120 L100,80 L200,120 L300,80 L400,120 L500,80 L600,120 L700,80 L800,120 L900,80 L1000,120 L1100,80 L1200,120 Z"
              fill={color}
            />
          </svg>
        );

      case 'glass':
        return (
          <div
            className="w-full relative overflow-hidden"
            style={{ height }}
          >
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{
                background: `linear-gradient(to ${isTop ? 'bottom' : 'top'}, ${color}, transparent)`,
              }}
            />
            {!disableAnimations && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'absolute left-0 right-0 pointer-events-none overflow-hidden',
        isTop ? 'top-0' : 'bottom-0',
        flip && 'rotate-180'
      )}
    >
      {renderSeparator()}
    </div>
  );
};

export default SectionSeparator;
