import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  User,
  Briefcase,
  Users,
  GraduationCap,
  Store,
  Heart,
  Target,
} from 'lucide-react';
import { trackSectionView } from '@/lib/tracking';
import { getStyleClasses } from '@/lib/styleTokens';
import type { StylePreset } from '@/lib/sectionModels';

interface Perfil {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface ParaQuemEContent {
  titulo?: string;
  subtitulo?: string;
  perfis_json?: string;
}

interface ParaQuemEProps {
  /** ID da LP para tracking; se não vier, só renderiza visualmente */
  lpId?: string;
  content?: ParaQuemEContent;
  previewOverride?: ParaQuemEContent;
  variante?: 'modelo_a' | 'modelo_b';
  disableAnimations?: boolean;
  cardStyle?: string;
  stylePreset?: StylePreset;
}

const defaultContent: ParaQuemEContent = {
  titulo: 'Para quem é',
  subtitulo: 'Nossa plataforma foi pensada para diferentes tipos de profissionais',
  perfis_json: JSON.stringify([
    {
      titulo: 'Empreendedores',
      descricao:
        'Lance seu produto ou serviço rapidamente com páginas profissionais.',
      icone: 'User',
    },
    {
      titulo: 'Agências',
      descricao:
        'Crie landing pages para múltiplos clientes de forma escalável.',
      icone: 'Building2',
    },
    {
      titulo: 'Freelancers',
      descricao:
        'Destaque seu portfólio e atraia mais clientes qualificados.',
      icone: 'Briefcase',
    },
  ]),
};

const iconMap: Record<string, typeof Building2> = {
  Building2,
  User,
  Briefcase,
  Users,
  GraduationCap,
  Store,
  Heart,
  Target,
};

export const ParaQuemE = ({
  lpId,
  content = {},
  previewOverride,
  variante = 'modelo_a',
  disableAnimations = false,
  cardStyle = '',
  stylePreset = 'glass',
}: ParaQuemEProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styleClasses = getStyleClasses(stylePreset);

  let perfis: Perfil[] = [];
  try {
    perfis = finalContent.perfis_json
      ? JSON.parse(finalContent.perfis_json)
      : [];
  } catch {
    perfis = [];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // tracking: seção "para_quem_e"
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return; // sem lpId = sem tracking (ex: preview/editor)
    if (hasTrackedViewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'para_quem_e', variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId, variante]);

  if (variante === 'modelo_b') {
    return (
      <section
        className="section-padding bg-gradient-to-b from-background to-card/50"
        id="para_quem_e"
        data-section-key="para_quem_e"
        ref={sectionRef}
      >
        <div className="section-container">
          <motion.div
            initial={disableAnimations ? undefined : { opacity: 0, y: 30 }}
            whileInView={
              disableAnimations ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={disableAnimations ? undefined : { duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">{finalContent.titulo}</h2>
            <p className="section-subtitle mx-auto">
              {finalContent.subtitulo}
            </p>
          </motion.div>

          <motion.div
            variants={disableAnimations ? undefined : containerVariants}
            initial={disableAnimations ? undefined : 'hidden'}
            whileInView={disableAnimations ? undefined : 'visible'}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto"
          >
            {perfis.map((perfil, index) => {
              const Icon = iconMap[perfil.icone || 'User'] || User;
              return (
                <motion.div
                  key={index}
                  variants={disableAnimations ? undefined : itemVariants}
                  className="flex-1 p-6 rounded-2xl border-2 border-border hover:border-primary/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {perfil.titulo}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {perfil.descricao}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Grid vertical
  return (
    <section
      className="section-padding"
      id="para_quem_e"
      data-section-key="para_quem_e"
      ref={sectionRef}
    >
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={disableAnimations ? undefined : { opacity: 0, x: -30 }}
            whileInView={
              disableAnimations ? undefined : { opacity: 1, x: 0 }
            }
            viewport={{ once: true }}
            transition={disableAnimations ? undefined : { duration: 0.6 }}
          >
            <h2 className="section-title mb-4">{finalContent.titulo}</h2>
            <p className="section-subtitle">{finalContent.subtitulo}</p>
          </motion.div>

          <motion.div
            variants={disableAnimations ? undefined : containerVariants}
            initial={disableAnimations ? undefined : 'hidden'}
            whileInView={disableAnimations ? undefined : 'visible'}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {perfis.map((perfil, index) => {
              const Icon = iconMap[perfil.icone || 'User'] || User;
              return (
                <motion.div
                  key={index}
                  variants={disableAnimations ? undefined : itemVariants}
                  className={`p-6 flex items-start gap-4 ${
                    cardStyle || 'premium-card-soft'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {perfil.titulo}
                    </h3>
                    <p className="text-muted-foreground">
                      {perfil.descricao}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
