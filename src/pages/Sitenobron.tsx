import { SEOHead } from '@/components/SEOHead';
import { MenuSection } from '@/components/sections/MenuSection';
import { Rodape } from '@/components/sections/Rodape';
import HeroParallax from '@/components/sections/premium/HeroParallax';
import { Cards3DShowcase } from '@/components/sections/premium/Cards3DShowcase';
import { FeaturesFloat } from '@/components/sections/premium/FeaturesFloat';
import { TestimonialCinematic } from '@/components/sections/premium/TestimonialCinematic';
import { CTAFinal } from '@/components/sections/premium/CTAFinal';
import { SectionSeparator } from '@/components/sections/premium/SectionSeparator';

// Static content for the nobron institutional site
const heroContent = {
  badge: 'Lançamento 2024',
  titulo: 'Crie Landing Pages e Sites',
  destaque: 'profissionais em minutos',
  subtitulo: 'Editor visual, templates animados e alto poder de conversão. Sem código, sem complicação.',
  texto_botao_primario: 'Começar agora grátis',
  url_botao_primario: '/auth/register',
  texto_botao_secundario: 'Ver demonstração',
  url_botao_secundario: '#showcase',
};

const showcaseContent = {
  titulo: 'Templates premium, sem limites',
  subtitulo: 'Escolha entre dezenas de modelos profissionais com animações reais',
  cards: [
    { 
      titulo: 'Animações Reais', 
      descricao: 'Templates com Motion e GSAP para impressionar seus visitantes',
      icone: 'sparkles',
    },
    { 
      titulo: 'Alta Conversão', 
      descricao: 'Designs otimizados com base em dados de milhares de páginas',
      icone: 'zap',
    },
    { 
      titulo: '100% Editável', 
      descricao: 'Personalize cores, textos e imagens sem tocar em código',
      icone: 'edit',
    },
  ],
};

const featuresContent = {
  titulo: 'Poder máximo, zero complexidade',
  subtitulo: 'Tudo que você precisa para criar páginas de alta conversão',
  itens: [
    { titulo: 'Domínio próprio', descricao: 'Configure seu domínio em minutos', icone: 'globe' },
    { titulo: 'Editor visual drag & drop', descricao: 'Arraste, solte e publique', icone: 'pointer' },
    { titulo: 'Modelos animados', descricao: 'Templates premium com Motion', icone: 'palette' },
    { titulo: 'SEO e performance', descricao: 'Otimizado para buscadores', icone: 'gauge' },
  ],
};

const testimonialContent = {
  titulo: 'O que nossos clientes dizem',
  depoimentos: [
    {
      texto: 'O SaaS-LP transformou completamente como criamos landing pages. O que levava dias agora fazemos em horas, com resultados muito melhores.',
      nome: 'Maria Silva',
      cargo: 'CEO, TechStartup',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
    {
      texto: 'Os templates premium com animações fizeram toda a diferença nas nossas taxas de conversão. Recomendo para qualquer empresa.',
      nome: 'João Santos',
      cargo: 'Marketing Director, Growth Co',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    },
  ],
  autoplay: true,
};

const ctaContent = {
  titulo: 'Pronto para publicar ainda hoje?',
  subtitulo: 'Comece gratuitamente e veja resultados em minutos. Sem cartão de crédito.',
  texto_botao: 'Criar minha página',
  url_botao: '/auth/register',
};

const menuContent = {
  brand_name: 'SaaS-LP',
  links_json: JSON.stringify([
    { label: 'Recursos', url: '#features' },
    { label: 'Templates', url: '#showcase' },
    { label: 'Depoimentos', url: '#testimonials' },
  ]),
  cta_label: 'Começar grátis',
  cta_url: '/auth/register',
};

const footerContent = {
  copyright: '© 2024 SaaS-LP. Todos os direitos reservados.',
  links_json: JSON.stringify([
    { label: 'Termos de Uso', url: '/termos' },
    { label: 'Privacidade', url: '/privacidade' },
    { label: 'Contato', url: '/contato' },
  ]),
};

const Sitenobron = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        settings={{
          meta_title: 'SaaS-LP | Crie Landing Pages Profissionais em Minutos',
          meta_description: 'Editor visual, templates animados e alto poder de conversão. Crie landing pages e sites profissionais sem código.',
        }}
      />

      {/* Menu */}
      <MenuSection content={menuContent} variante="modelo_a" />

      {/* Hero */}
      <HeroParallax content={heroContent} />

      {/* Separator */}
      <div className="relative h-20 bg-muted/30">
        <SectionSeparator type="wave" position="top" color="hsl(var(--background))" />
      </div>

      {/* 3D Showcase */}
      <section id="showcase">
        <Cards3DShowcase content={showcaseContent} />
      </section>

      {/* Separator */}
      <div className="relative h-16">
        <SectionSeparator type="diagonal" position="bottom" color="hsl(var(--background))" />
      </div>

      {/* Features */}
      <section id="features">
        <FeaturesFloat content={featuresContent} />
      </section>

      {/* Separator */}
      <div className="relative h-16 bg-muted/30">
        <SectionSeparator type="wave" position="top" color="hsl(var(--background))" flip />
      </div>

      {/* Testimonials */}
      <section id="testimonials">
        <TestimonialCinematic content={testimonialContent} />
      </section>

      {/* CTA Final */}
      <CTAFinal content={ctaContent} />

      {/* Footer */}
      <Rodape content={footerContent} variante="modelo_b" />
    </div>
  );
};

export default Sitenobron;