import { FAQ } from './FAQ';

interface FAQMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const FAQMinimal = (props: FAQMinimalProps) => {
  return (
    <FAQ 
      {...props} 
      cardStyle="bg-white border border-zinc-200 shadow-sm" 
    />
  );
};

export default FAQMinimal;
