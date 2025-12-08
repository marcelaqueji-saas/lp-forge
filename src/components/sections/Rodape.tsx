import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { trackSectionView } from '@/lib/tracking';

interface Link {
  label: string;
  url: string;
}

interface RodapeContent {
  copyright?: string;
  links_json?: string;
}

interface RodapeProps {
  /** ID da LP para tracking; se não vier, só renderiza sem eventos */
  lpId?: string;
  content?: RodapeContent;
  variante?: 'modelo_a' | 'modelo_b';
  previewOverride?: RodapeContent;
}

const currentYear = new Date().getFullYear();

const defaultContent: RodapeContent = {
  copyright: `© ${currentYear} nobron. Todos os direitos reservados.`,
  links_json: JSON.stringify([
    { label: 'Termos de uso', url: '#' },
    { label: 'Privacidade', url: '#' },
    { label: 'Contato', url: '#' },
  ]),
};


export const Rodape = ({
  lpId,
  content = {},
  variante = 'modelo_a',
  previewOverride,
}: RodapeProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let links: Link[] = [];
  try {
    links = finalContent.links_json
      ? JSON.parse(finalContent.links_json)
      : [];
  } catch {
    links = [];
  }

  // tracking: seção "rodape"
  const footerRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return; // preview/editor sem lpId = sem tracking
    if (hasTrackedViewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'rodape');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 } // aparece menos, é fim de página
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId]);

  // Modelo B - Two lines, stacked layout
  if (variante === 'modelo_b') {
    return (
      <footer
        id="rodape"
        data-section-key="rodape"
        className="py-10 px-4 border-t border-border bg-muted/30"
        ref={footerRef}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="w-full border-t border-border pt-6">
              <p className="text-muted-foreground text-sm text-center">
                {finalContent.copyright}
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    );
  }

  // Modelo A - Single line, horizontal layout (default)
  return (
    <footer
      id="rodape"
      data-section-key="rodape"
      className="py-8 px-4 border-t border-border bg-card/50"
      ref={footerRef}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            {finalContent.copyright}
          </p>
          <nav className="flex items-center gap-6">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </motion.div>
      </div>
    </footer>
  );
};
