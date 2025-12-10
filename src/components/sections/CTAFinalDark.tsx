import { ChamadaFinal } from './ChamadaFinal';

interface CTAFinalDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  onPrimaryCTAClick?: () => void;
}

export const CTAFinalDark = (props: CTAFinalDarkProps) => {
  return (
    <ChamadaFinal 
      {...props} 
      cardStyle="bg-zinc-800/90 border border-zinc-700/50 shadow-xl" 
    />
  );
};

export default CTAFinalDark;
