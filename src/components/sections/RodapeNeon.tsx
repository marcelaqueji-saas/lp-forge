import { Rodape } from './Rodape';

interface RodapeNeonProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const RodapeNeon = (props: RodapeNeonProps) => {
  return (
    <div className="preset-neon">
      <Rodape {...props} />
    </div>
  );
};

export default RodapeNeon;
