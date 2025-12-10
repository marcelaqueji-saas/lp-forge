import { Planos } from './Planos';

interface PlanosMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const PlanosMinimal = (props: PlanosMinimalProps) => {
  return (
    <Planos 
      {...props} 
      cardStyle="bg-white border border-zinc-200 shadow-sm" 
    />
  );
};

export default PlanosMinimal;
