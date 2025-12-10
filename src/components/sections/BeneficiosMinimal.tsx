import { Beneficios } from './Beneficios';

interface BeneficiosMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  disableAnimations?: boolean;
}

export const BeneficiosMinimal = (props: BeneficiosMinimalProps) => {
  return (
    <Beneficios 
      {...props} 
      stylePreset="minimal" 
      motionPreset="fade-stagger" 
    />
  );
};

export default BeneficiosMinimal;
