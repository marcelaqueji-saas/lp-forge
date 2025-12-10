import { Beneficios } from './Beneficios';
import type { StylePreset, MotionPreset } from '@/lib/sectionModels';

interface BeneficiosDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  disableAnimations?: boolean;
}

export const BeneficiosDark = (props: BeneficiosDarkProps) => {
  return (
    <Beneficios 
      {...props} 
      stylePreset="dark" 
      motionPreset="fade-stagger" 
    />
  );
};

export default BeneficiosDark;
