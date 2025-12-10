import { MenuSection } from './MenuSection';

interface MenuNeonProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const MenuNeon = (props: MenuNeonProps) => {
  return (
    <div className="preset-neon">
      <MenuSection {...props} />
    </div>
  );
};

export default MenuNeon;
