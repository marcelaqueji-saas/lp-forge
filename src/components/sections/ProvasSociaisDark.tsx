import { ProvasSociais } from './ProvasSociais';

interface ProvasSociaisDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
}

export const ProvasSociaisDark = (props: ProvasSociaisDarkProps) => {
  return (
    <ProvasSociais 
      {...props} 
      cardStyle="bg-zinc-800/90 border border-zinc-700/50 shadow-xl" 
    />
  );
};

export default ProvasSociaisDark;
