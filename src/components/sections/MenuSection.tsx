import { motion } from 'framer-motion';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

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
    { label: 'Início', url: '#hero' },
    { label: 'Benefícios', url: '#beneficios' },
    { label: 'Planos', url: '#planos' },
    { label: 'FAQ', url: '#faq' },
  ]),
  cta_label: 'Fale conosco',
  cta_url: '#chamada_final',
};

/**
 * Handle navigation - smooth scroll for anchors, router navigation for routes
 */
const handleNavigation = (url: string, e?: React.MouseEvent) => {
  if (!url) return;
  
  // Handle anchor links with smooth scroll
  if (url.startsWith('#')) {
    e?.preventDefault();
    const targetId = url.substring(1);
    
    // Try to find element by data-section-key first (editor mode)
    let element = document.querySelector(`[data-section-key="${targetId}"]`) as HTMLElement;
    
    // Fallback to id
    if (!element) {
      element = document.getElementById(targetId) as HTMLElement;
    }
    
    // Fallback to section name patterns
    if (!element) {
      element = document.querySelector(`#${targetId}, [id*="${targetId}"]`) as HTMLElement;
    }
    
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn(`[MenuSection] Target element not found: ${targetId}`);
    }
    return;
  }
  
  // External links - let browser handle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return; // Let the <a> tag handle it normally
  }
  
  // Internal routes - use navigation (for SPAs)
  // The <a> tag will handle it if using React Router Link behavior
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

  const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    handleNavigation(url, e);
    setMobileMenuOpen(false);
  }, []);

  if (variante === 'modelo_b') {
    return (
      <header 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
        id="menu"
        data-section-key="menu"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="section-container py-4"
        >
          {/* Brand centered */}
          <div className="text-center mb-3">
            <a 
              href="#hero" 
              onClick={(e) => handleLinkClick('#hero', e)}
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {finalContent.brand_name}
            </a>
          </div>
          
          {/* Links centered below */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url || '#'}
                onClick={(e) => handleLinkClick(link.url || '#', e)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a 
                  href={finalContent.cta_url}
                  onClick={(e) => handleLinkClick(finalContent.cta_url!, e)}
                >
                  {finalContent.cta_label}
                </a>
              </Button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
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
                  href={link.url || '#'}
                  onClick={(e) => handleLinkClick(link.url || '#', e)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {finalContent.cta_label && finalContent.cta_url && (
                <Button size="sm" asChild className="mt-2">
                  <a 
                    href={finalContent.cta_url}
                    onClick={(e) => handleLinkClick(finalContent.cta_url!, e)}
                  >
                    {finalContent.cta_label}
                  </a>
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
    <header 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
      id="menu"
      data-section-key="menu"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="section-container py-4"
      >
        <div className="flex items-center justify-between">
          {/* Brand left */}
          <a 
            href="#hero"
            onClick={(e) => handleLinkClick('#hero', e)}
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            {finalContent.brand_name}
          </a>
          
          {/* Links right */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url || '#'}
                onClick={(e) => handleLinkClick(link.url || '#', e)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a 
                  href={finalContent.cta_url}
                  onClick={(e) => handleLinkClick(finalContent.cta_url!, e)}
                >
                  {finalContent.cta_label}
                </a>
              </Button>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
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
                href={link.url || '#'}
                onClick={(e) => handleLinkClick(link.url || '#', e)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild className="w-fit mt-2">
                <a 
                  href={finalContent.cta_url}
                  onClick={(e) => handleLinkClick(finalContent.cta_url!, e)}
                >
                  {finalContent.cta_label}
                </a>
              </Button>
            )}
          </motion.nav>
        )}
      </motion.div>
    </header>
  );
};
