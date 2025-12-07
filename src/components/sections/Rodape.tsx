import { motion } from 'framer-motion';

interface Link {
  label: string;
  url: string;
}

interface RodapeContent {
  copyright?: string;
  links_json?: string;
}

interface RodapeProps {
  content?: RodapeContent;
  variante?: 'modelo_a' | 'modelo_b';
  previewOverride?: RodapeContent;
}

const defaultContent: RodapeContent = {
  copyright: '© 2024 SaaS LP. Todos os direitos reservados.',
  links_json: JSON.stringify([
    { label: 'Termos de uso', url: '#' },
    { label: 'Privacidade', url: '#' },
    { label: 'Contato', url: '#' },
  ]),
};

export const Rodape = ({ content = {}, variante = 'modelo_a', previewOverride }: RodapeProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let links: Link[] = [];
  try {
    links = finalContent.links_json ? JSON.parse(finalContent.links_json) : [];
  } catch {
    links = [];
  }

  // Modelo B - Two lines, stacked layout
  if (variante === 'modelo_b') {
    return (
      <footer id="rodape" data-section-key="rodape" className="py-10 px-4 border-t border-border bg-muted/30">
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
              <p className="text-muted-foreground text-sm text-center">{finalContent.copyright}</p>
            </div>
          </motion.div>
        </div>
      </footer>
    );
  }

  // Modelo A - Single line, horizontal layout (default)
  return (
    <footer id="rodape" data-section-key="rodape" className="py-8 px-4 border-t border-border bg-card/50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">{finalContent.copyright}</p>
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
