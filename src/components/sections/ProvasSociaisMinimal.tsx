import { ProvasSociais } from './ProvasSociais';

interface ProvasSociaisMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
}

export const ProvasSociaisMinimal = (props: ProvasSociaisMinimalProps) => {
  return (
    <ProvasSociais 
      {...props} 
      cardStyle="bg-white border border-zinc-200 shadow-sm" 
    />
  );
};

export default ProvasSociaisMinimal;
