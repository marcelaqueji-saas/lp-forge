import { Planos } from './Planos';

interface PlanosDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const PlanosDark = (props: PlanosDarkProps) => {
  return (
    <Planos 
      {...props} 
      cardStyle="bg-zinc-800/90 border border-zinc-700/50 shadow-xl" 
    />
  );
};

export default PlanosDark;
