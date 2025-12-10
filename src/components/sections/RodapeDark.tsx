import { Rodape } from './Rodape';

interface RodapeDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const RodapeDark = (props: RodapeDarkProps) => {
  return (
    <div className="preset-dark">
      <Rodape {...props} />
    </div>
  );
};

export default RodapeDark;
