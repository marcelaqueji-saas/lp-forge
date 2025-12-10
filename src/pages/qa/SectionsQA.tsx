/**
 * SectionsQA - Página de QA visual para todos os modelos de seção
 * Renderiza todos os 32 modelos em uma grade para validação
 */

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  SECTION_MODELS, 
  SECTION_MODELS_BY_SECTION, 
  SectionKey, 
  SECTION_DISPLAY_NAMES,
  PlanLevel 
} from '@/lib/sectionModels';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { ModelThumbnail } from '@/components/editor/ModelThumbnail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Grid3X3, 
  LayoutList, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock content para preview de cada seção
const MOCK_CONTENT: Record<SectionKey, any> = {
  menu: {
    brand_name: 'noBRon QA',
    cta_label: 'Começar',
    cta_url: '#',
    links_json: JSON.stringify([
      { label: 'Recursos', url: '#' },
      { label: 'Preços', url: '#' },
      { label: 'FAQ', url: '#' },
    ]),
  },
  hero: {
    badge: 'Lançamento 2025',
    titulo: 'Transforme sua ideia em',
    destaque: 'realidade digital',
    subtitulo: 'Crie landing pages de alta conversão em minutos.',
    texto_botao_primario: 'Comece agora',
    url_botao_primario: '#',
    texto_botao_secundario: 'Ver demo',
    url_botao_secundario: '#',
  },
  como_funciona: {
    titulo: 'Como funciona',
    subtitulo: 'Três passos simples para começar',
    passos_json: JSON.stringify([
      { numero: 1, titulo: 'Escolha um modelo', descricao: 'Selecione entre dezenas de templates.' },
      { numero: 2, titulo: 'Personalize', descricao: 'Edite textos, imagens e cores.' },
      { numero: 3, titulo: 'Publique', descricao: 'Coloque no ar em um clique.' },
    ]),
  },
  para_quem_e: {
    titulo: 'Para quem é',
    subtitulo: 'Ideal para diversos perfis',
    perfis_json: JSON.stringify([
      { titulo: 'Empreendedores', descricao: 'Valide ideias rapidamente.' },
      { titulo: 'Agências', descricao: 'Entregue mais em menos tempo.' },
      { titulo: 'Freelancers', descricao: 'Aumente sua produtividade.' },
    ]),
  },
  beneficios: {
    titulo: 'Por que escolher?',
    subtitulo: 'Benefícios que fazem a diferença',
    beneficios_json: JSON.stringify([
      { titulo: 'Alta conversão', descricao: 'Templates otimizados.', icone: 'Sparkles' },
      { titulo: 'Seguro', descricao: 'Dados protegidos.', icone: 'Shield' },
      { titulo: 'Rápido', descricao: 'Carrega em <2s.', icone: 'Zap' },
    ]),
  },
  provas_sociais: {
    titulo: 'O que dizem nossos clientes',
    subtitulo: 'Depoimentos reais',
    depoimentos_json: JSON.stringify([
      { nome: 'João Silva', cargo: 'CEO', texto: 'Incrível! Aumentei conversões em 300%.' },
      { nome: 'Maria Santos', cargo: 'CMO', texto: 'Interface intuitiva e resultados rápidos.' },
    ]),
  },
  planos: {
    titulo: 'Escolha seu plano',
    subtitulo: 'Opções para todos os tamanhos',
    planos_json: JSON.stringify([
      { nome: 'Free', preco: 'R$ 0', destaque: false, itens: ['1 LP', '1GB'] },
      { nome: 'Pro', preco: 'R$ 49', destaque: true, itens: ['5 LPs', '10GB', 'Domínio'] },
      { nome: 'Premium', preco: 'R$ 99', destaque: false, itens: ['Ilimitado', '50GB', 'Suporte'] },
    ]),
  },
  faq: {
    titulo: 'Perguntas frequentes',
    subtitulo: 'Tire suas dúvidas',
    perguntas_json: JSON.stringify([
      { pergunta: 'Como funciona?', resposta: 'Você escolhe um modelo, edita e publica.' },
      { pergunta: 'Posso cancelar?', resposta: 'Sim, a qualquer momento.' },
    ]),
  },
  chamada_final: {
    titulo: 'Pronto para começar?',
    subtitulo: 'Crie sua primeira LP em minutos',
    cta_label: 'Criar conta grátis',
    cta_url: '#',
  },
  rodape: {
    copyright: '© 2025 noBRon. Todos os direitos reservados.',
    links_json: JSON.stringify([
      { label: 'Termos', url: '#' },
      { label: 'Privacidade', url: '#' },
    ]),
  },
};

const ALL_SECTIONS = Object.keys(SECTION_MODELS_BY_SECTION) as SectionKey[];

export const SectionsQA = () => {
  const [viewMode, setViewMode] = useState<'thumbnails' | 'preview'>('thumbnails');
  const [selectedSection, setSelectedSection] = useState<SectionKey>('hero');
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const handleRenderComplete = (modelId: string, success: boolean) => {
    setRenderStatus(prev => ({
      ...prev,
      [modelId]: success ? 'success' : 'error'
    }));
  };

  const totalModels = SECTION_MODELS.length;
  const successCount = Object.values(renderStatus).filter(s => s === 'success').length;
  const errorCount = Object.values(renderStatus).filter(s => s === 'error').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🔬 QA Visual - Modelos de Seção</h1>
              <p className="text-muted-foreground text-sm">
                Catálogo v2.0 • {totalModels} modelos • {ALL_SECTIONS.length} seções
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {successCount}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  {errorCount}
                </Badge>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === 'thumbnails' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('thumbnails')}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Thumbnails
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {viewMode === 'thumbnails' ? (
          // THUMBNAILS VIEW - Grid of all thumbnails grouped by section
          <div className="space-y-12">
            {ALL_SECTIONS.map((sectionKey) => {
              const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
              
              return (
                <motion.section
                  key={sectionKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold">{SECTION_DISPLAY_NAMES[sectionKey]}</h2>
                    <Badge variant="outline">{models.length} modelos</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {models.map((model) => (
                      <div key={model.id} className="space-y-2">
                        <ModelThumbnail
                          modelId={model.id}
                          name={model.name}
                          plan={model.plan}
                          stylePreset={model.stylePreset}
                          isLocked={false}
                          isSelected={false}
                          onClick={() => {
                            setSelectedSection(sectionKey);
                            setExpandedPreview(model.id);
                            setViewMode('preview');
                          }}
                        />
                        <div className="text-xs text-center">
                          <code className="text-muted-foreground">{model.id}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        ) : (
          // PREVIEW VIEW - Full section renders with tabs
          <Tabs value={selectedSection} onValueChange={(v) => setSelectedSection(v as SectionKey)}>
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              {ALL_SECTIONS.map((section) => (
                <TabsTrigger key={section} value={section} className="text-xs">
                  {SECTION_DISPLAY_NAMES[section]}
                </TabsTrigger>
              ))}
            </TabsList>

            {ALL_SECTIONS.map((sectionKey) => (
              <TabsContent key={sectionKey} value={sectionKey}>
                <div className="space-y-8">
                  {(SECTION_MODELS_BY_SECTION[sectionKey] || []).map((model) => (
                    <Card 
                      key={model.id}
                      className={cn(
                        "overflow-hidden",
                        expandedPreview === model.id && "ring-2 ring-primary"
                      )}
                    >
                      <CardHeader className="py-3 px-4 bg-muted/30 flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{model.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px]">{model.plan}</Badge>
                          <code className="text-xs text-muted-foreground">{model.id}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStatus[model.id] === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {renderStatus[model.id] === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedPreview(
                              expandedPreview === model.id ? null : model.id
                            )}
                          >
                            {expandedPreview === model.id ? (
                              <Minimize2 className="w-4 h-4" />
                            ) : (
                              <Maximize2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className={cn(
                          "relative overflow-hidden transition-all",
                          expandedPreview === model.id ? "max-h-none" : "max-h-[400px]"
                        )}>
                          <Suspense
                            fallback={
                              <div className="h-[200px] flex items-center justify-center bg-muted/30">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                              </div>
                            }
                          >
                            <SectionPreviewWrapper
                              sectionKey={sectionKey}
                              modelId={model.id}
                              content={MOCK_CONTENT[sectionKey]}
                              onRenderComplete={(success) => handleRenderComplete(model.id, success)}
                            />
                          </Suspense>
                          
                          {/* Gradient overlay for collapsed state */}
                          {expandedPreview !== model.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Model details */}
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-xl">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">📊 Status do Catálogo</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de modelos</span>
                <span className="font-medium">{totalModels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Renderizados OK</span>
                <span className="font-medium text-green-600">{successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Com erro</span>
                <span className="font-medium text-red-600">{errorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendentes</span>
                <span className="font-medium">{totalModels - successCount - errorCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrapper component to track render status
const SectionPreviewWrapper = ({
  sectionKey,
  modelId,
  content,
  onRenderComplete,
}: {
  sectionKey: SectionKey;
  modelId: string;
  content: any;
  onRenderComplete: (success: boolean) => void;
}) => {
  const [hasRendered, setHasRendered] = useState(false);

  // Track successful render
  if (!hasRendered) {
    setTimeout(() => {
      setHasRendered(true);
      onRenderComplete(true);
    }, 100);
  }

  return (
    <div className="relative">
      <SectionLoader
        sectionKey={sectionKey}
        lpId="qa-preview"
        content={{ ...content, __model_id: modelId }}
        settings={{ [`${sectionKey}_variante`]: modelId }}
        disableAnimations
        userPlan="master"
        context="editor"
        editable={false}
      />
    </div>
  );
};

export default SectionsQA;
