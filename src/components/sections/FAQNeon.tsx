import { FAQ } from './FAQ';

interface FAQNeonProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const FAQNeon = (props: FAQNeonProps) => {
  return (
    <FAQ 
      {...props} 
      cardStyle="bg-zinc-900/80 border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" 
    />
  );
};

export default FAQNeon;
