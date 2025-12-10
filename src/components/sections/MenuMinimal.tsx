import { MenuSection } from './MenuSection';

interface MenuMinimalProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const MenuMinimal = (props: MenuMinimalProps) => {
  return (
    <div className="preset-minimal">
      <MenuSection {...props} />
    </div>
  );
};

export default MenuMinimal;
