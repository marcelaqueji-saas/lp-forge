import { Rodape } from './Rodape';

interface RodapeMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const RodapeMinimal = (props: RodapeMinimalProps) => {
  return (
    <div className="preset-minimal">
      <Rodape {...props} />
    </div>
  );
};

export default RodapeMinimal;
