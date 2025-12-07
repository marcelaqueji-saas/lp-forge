/**
 * Banner de consentimento de cookies (LGPD)
 * 
 * Configurável via props ou settings globais
 * Integrado com sistema de tracking
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getConsentState, 
  setConsentState, 
  ConsentState 
} from '@/lib/tracking';

interface CookieConsentBannerProps {
  // Textos customizáveis
  title?: string;
  description?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  
  // Callbacks
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onCustomize?: (categories: ConsentState['categories']) => void;
  
  // Forçar exibição (para testes)
  forceShow?: boolean;
}

export const CookieConsentBanner = ({
  title = 'Utilizamos cookies',
  description = 'Este site utiliza cookies para melhorar sua experiência. Você pode escolher quais tipos de cookies aceitar.',
  privacyPolicyUrl = '/privacidade',
  termsUrl = '/termos',
  onAcceptAll,
  onRejectAll,
  onCustomize,
  forceShow = false,
}: CookieConsentBannerProps) => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState({
    essential: true, // Sempre true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar se já tem consentimento salvo
    const existingConsent = getConsentState();
    
    if (forceShow) {
      setVisible(true);
      return;
    }
    
    if (!existingConsent) {
      // Aguardar um momento para não atrapalhar o carregamento inicial
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleAcceptAll = () => {
    const allCategories = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    setConsentState(allCategories);
    setVisible(false);
    onAcceptAll?.();
    
    // Recarregar para inicializar tracking
    window.location.reload();
  };

  const handleRejectAll = () => {
    const minimalCategories = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    
    setConsentState(minimalCategories);
    setVisible(false);
    onRejectAll?.();
  };

  const handleSavePreferences = () => {
    setConsentState(categories);
    setVisible(false);
    onCustomize?.(categories);
    
    // Se habilitou analytics/marketing, recarregar para inicializar
    if (categories.analytics || categories.marketing) {
      window.location.reload();
    }
  };

  const toggleCategory = (category: 'analytics' | 'marketing') => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {privacyPolicyUrl && (
                      <a 
                        href={privacyPolicyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Política de Privacidade
                      </a>
                    )}
                    {termsUrl && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <a 
                          href={termsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Termos de Uso
                        </a>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setVisible(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {/* Settings expandidas */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      {/* Essential - sempre ativo */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">Essenciais</p>
                          <p className="text-xs text-muted-foreground">
                            Necessários para o funcionamento do site
                          </p>
                        </div>
                        <div className="w-10 h-6 rounded-full bg-primary flex items-center justify-end pr-1">
                          <div className="w-4 h-4 rounded-full bg-white" />
                        </div>
                      </div>
                      
                      {/* Analytics */}
                      <button
                        onClick={() => toggleCategory('analytics')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium text-sm">Analytics</p>
                          <p className="text-xs text-muted-foreground">
                            Nos ajudam a entender como você usa o site
                          </p>
                        </div>
                        <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                          categories.analytics ? 'bg-primary justify-end pr-1' : 'bg-slate-300 justify-start pl-1'
                        }`}>
                          <div className="w-4 h-4 rounded-full bg-white" />
                        </div>
                      </button>
                      
                      {/* Marketing */}
                      <button
                        onClick={() => toggleCategory('marketing')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium text-sm">Marketing</p>
                          <p className="text-xs text-muted-foreground">
                            Usados para personalizar anúncios
                          </p>
                        </div>
                        <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                          categories.marketing ? 'bg-primary justify-end pr-1' : 'bg-slate-300 justify-start pl-1'
                        }`}>
                          <div className="w-4 h-4 rounded-full bg-white" />
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Actions */}
            <div className="px-4 md:px-6 pb-4 md:pb-6 flex flex-wrap gap-2">
              {showSettings ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar preferências
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Personalizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                  >
                    Rejeitar não essenciais
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                  >
                    Aceitar todos
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
