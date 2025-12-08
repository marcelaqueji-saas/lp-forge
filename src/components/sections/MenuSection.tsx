import { motion } from 'framer-motion';
import { Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback, useEffect, useRef } from 'react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

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
  /** ID da LP para tracking; se não vier, só renderiza sem eventos */
  lpId?: string;
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
    let element = document.querySelector(
      `[data-section-key="${targetId}"]`
    ) as HTMLElement;

    // Fallback to id
    if (!element) {
      element = document.getElementById(targetId) as HTMLElement;
    }

    // Fallback to section name patterns
    if (!element) {
      element = document.querySelector(
        `#${targetId}, [id*="${targetId}"]`
      ) as HTMLElement;
    }

    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
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

export const MenuSection = ({
  lpId,
  content = {},
  variante = 'modelo_a',
  previewOverride,
}: MenuSectionProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let links: Link[] = [];
  try {
    links = finalContent.links_json
      ? JSON.parse(finalContent.links_json)
      : [];
  } catch {
    links = [];
  }

  // tracking: seção "menu"
  const headerRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return; // preview/editor sem lpId = sem tracking
    if (hasTrackedViewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'menu');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId]);

  /**
   * type:
   *  - 'link'  => itens de navegação normais (ctaType = 'secondary')
   *  - 'cta'   => botão principal do menu (ctaType = 'primary')
   */
  const handleLinkClick = useCallback(
    (url: string, e: React.MouseEvent, type: 'link' | 'cta' = 'link') => {
      if (lpId) {
        trackCTAClick(
          lpId,
          'menu',
          type === 'cta' ? 'primary' : 'secondary',
          url
        );
      }

      handleNavigation(url, e);
      setMobileMenuOpen(false);
    },
    [lpId]
  );

  if (variante === 'modelo_b') {
    return (
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
        id="menu"
        data-section-key="menu"
        ref={headerRef}
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
              onClick={(e) => handleLinkClick('#hero', e, 'link')}
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
                onClick={(e) =>
                  handleLinkClick(link.url || '#', e, 'link')
                }
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a
                  href={finalContent.cta_url}
                  onClick={(e) =>
                    handleLinkClick(finalContent.cta_url!, e, 'cta')
                  }
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
                  onClick={(e) =>
                    handleLinkClick(link.url || '#', e, 'link')
                  }
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {finalContent.cta_label && finalContent.cta_url && (
                <Button size="sm" asChild className="mt-2">
                  <a
                    href={finalContent.cta_url}
                    onClick={(e) =>
                      handleLinkClick(finalContent.cta_url!, e, 'cta')
                    }
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
      ref={headerRef}
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
            onClick={(e) => handleLinkClick('#hero', e, 'link')}
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
                onClick={(e) =>
                  handleLinkClick(link.url || '#', e, 'link')
                }
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild>
                <a
                  href={finalContent.cta_url}
                  onClick={(e) =>
                    handleLinkClick(finalContent.cta_url!, e, 'cta')
                  }
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
                onClick={(e) =>
                  handleLinkClick(link.url || '#', e, 'link')
                }
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            {finalContent.cta_label && finalContent.cta_url && (
              <Button size="sm" asChild className="w-fit mt-2">
                <a
                  href={finalContent.cta_url}
                  onClick={(e) =>
                    handleLinkClick(finalContent.cta_url!, e, 'cta')
                  }
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
