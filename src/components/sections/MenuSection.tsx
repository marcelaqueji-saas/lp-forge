import { motion } from 'framer-motion';
import { Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Link {
  label: string;
  url: string;
}

interface MenuContent {
  brand_name?: string;
  links_json?: string;
  cta_label?: string;
  cta_url?: string;
}

interface MenuSectionProps {
  content?: MenuContent;
  variante?: 'modelo_a' | 'modelo_b';
  previewOverride?: MenuContent;
}

const defaultContent: MenuContent = {
  brand_name: 'Minha Página',
  links_json: JSON.stringify([
    { label: 'Início', url: '#inicio' },
    { label: 'Sobre', url: '#sobre' },
    { label: 'Contato', url: '#contato' },
  ]),
  cta_label: 'Fale conosco',
  cta_url: '#contato',
};

export const MenuSection = ({ content = {}, variante = 'modelo_a', previewOverride }: MenuSectionProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let links: Link[] = [];
  try {
    links = finalContent.links_json ? JSON.parse(finalContent.links_json) : [];
  } catch {
    links = [];
  }

  if (variante === 'modelo_b') {
    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="section-container py-4"
        >
          {/* Brand centered */}
          <div className="text-center mb-3">
            <a href="#" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              {finalContent.brand_name}
            </a>
          </div>
          
          {/* Links centered below */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a href={finalContent.cta_url}>{finalContent.cta_label}</a>
              </Button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-2 flex flex-col items-center gap-3"
            >
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {finalContent.cta_label && finalContent.cta_url && (
                <Button size="sm" asChild className="mt-2">
                  <a href={finalContent.cta_url}>{finalContent.cta_label}</a>
                </Button>
              )}
            </motion.nav>
          )}
        </motion.div>
      </header>
    );
  }

  // Modelo A - Classic horizontal layout
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="section-container py-4"
      >
        <div className="flex items-center justify-between">
          {/* Brand left */}
          <a href="#" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            {finalContent.brand_name}
          </a>
          
          {/* Links right */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a href={finalContent.cta_url}>{finalContent.cta_label}</a>
              </Button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-2 flex flex-col gap-3"
          >
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild className="w-fit mt-2">
                <a href={finalContent.cta_url}>{finalContent.cta_label}</a>
              </Button>
            )}
          </motion.nav>
        )}
      </motion.div>
    </header>
  );
};
