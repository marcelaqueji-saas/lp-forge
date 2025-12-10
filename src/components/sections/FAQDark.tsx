import { FAQ } from './FAQ';

interface FAQDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const FAQDark = (props: FAQDarkProps) => {
  return (
    <FAQ 
      {...props} 
      cardStyle="bg-zinc-800/90 border border-zinc-700/50 shadow-xl" 
    />
  );
};

export default FAQDark;
