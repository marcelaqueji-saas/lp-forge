import { MenuSection } from './MenuSection';

interface MenuDarkProps {
  lpId?: string;
  content?: any;
  previewOverride?: any;
  variante?: 'modelo_a' | 'modelo_b';
}

export const MenuDark = (props: MenuDarkProps) => {
  return (
    <div className="preset-dark">
      <MenuSection {...props} />
    </div>
  );
};

export default MenuDark;
