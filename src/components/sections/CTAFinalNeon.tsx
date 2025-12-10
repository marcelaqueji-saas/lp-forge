import { ChamadaFinal } from './ChamadaFinal';

interface CTAFinalNeonProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  onPrimaryCTAClick?: () => void;
}

export const CTAFinalNeon = (props: CTAFinalNeonProps) => {
  return (
    <ChamadaFinal 
      {...props} 
      cardStyle="bg-zinc-900/80 border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" 
    />
  );
};

export default CTAFinalNeon;
