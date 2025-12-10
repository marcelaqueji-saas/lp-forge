import { Beneficios } from './Beneficios';

interface BeneficiosNeonProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  disableAnimations?: boolean;
}

export const BeneficiosNeon = (props: BeneficiosNeonProps) => {
  return (
    <Beneficios 
      {...props} 
      stylePreset="neon" 
      motionPreset="spotlight" 
    />
  );
};

export default BeneficiosNeon;
