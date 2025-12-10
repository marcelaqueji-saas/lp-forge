import { ChamadaFinal } from './ChamadaFinal';

interface CTAFinalMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  onPrimaryCTAClick?: () => void;
}

export const CTAFinalMinimal = (props: CTAFinalMinimalProps) => {
  return (
    <ChamadaFinal 
      {...props} 
      cardStyle="bg-white border border-zinc-200 shadow-sm" 
    />
  );
};

export default CTAFinalMinimal;
