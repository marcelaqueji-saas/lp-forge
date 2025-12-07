import { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { markEditorTourCompleted, markOnboardingCompleted } from '@/lib/userApi';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditorTourProps {
  run: boolean;
  onFinish: () => void;
}

const desktopTourSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-4">
        <h3 className="text-xl font-bold mb-2">Bem-vindo ao Editor! ✨</h3>
        <p className="text-muted-foreground">
          Tudo o que você vê aqui pode ser editado. Vamos fazer um tour rápido para você conhecer as ferramentas.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-header"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Sua primeira seção</h4>
        <p className="text-sm text-muted-foreground">
          Esta é a primeira parte da sua página. Você pode personalizar cada seção conforme sua necessidade.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-layout"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Trocar layout</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você pode trocar o visual desta seção e escolher outro modelo instantaneamente.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-edit"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Editar conteúdo</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você pode alterar textos, imagens e botões desta seção.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-effects"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Efeitos visuais premium ✨</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você ativa fundos em glass, gradientes animados, animações suaves e efeitos de cursor para deixar sua seção com cara de produto premium.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="editor-top-actions"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Ações principais</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você salva e publica suas mudanças ou volta ao painel.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-4">
        <h3 className="text-xl font-bold mb-2">Pronto! 🚀</h3>
        <p className="text-muted-foreground mb-3">
          Agora é só rolar a página e editar cada parte do seu site. Bom trabalho!
        </p>
        <p className="text-xs text-muted-foreground">
          💡 Dica: Sua página deve estar em conformidade com a LGPD. Configure os avisos de cookies e política de privacidade nas configurações.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
];

// Simplified tour for mobile - fewer steps, simpler targets
const mobileTourSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-3">
        <h3 className="text-lg font-bold mb-2">Bem-vindo! ✨</h3>
        <p className="text-sm text-muted-foreground">
          Tudo pode ser editado! Use os botões em cada seção.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-header"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1 text-sm">Edite suas seções</h4>
        <p className="text-xs text-muted-foreground">
          Toque em "Editar" para mudar textos, 🎨 para layout e ✨ para efeitos premium.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-3">
        <h3 className="text-lg font-bold mb-2">Pronto! 🚀</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Role a página e edite cada seção. Bom trabalho!
        </p>
        <p className="text-[10px] text-muted-foreground">
          💡 Configure LGPD e cookies nas configurações.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
];

export const EditorTour = ({ run, onFinish }: EditorTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const isMobile = useIsMobile();
  
  const tourSteps = isMobile ? mobileTourSteps : desktopTourSteps;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      markEditorTourCompleted();
      markOnboardingCompleted();
      onFinish();
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={tourSteps}
      stepIndex={stepIndex}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--card))',
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
        },
        tooltip: {
          borderRadius: 20,
          padding: isMobile ? 16 : 20,
          maxWidth: isMobile ? 300 : 400,
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: isMobile ? '8px 4px' : '12px 4px',
        },
        buttonNext: {
          borderRadius: 999,
          padding: isMobile ? '8px 16px' : '10px 20px',
          fontSize: isMobile ? 13 : 14,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
        },
        buttonBack: {
          marginRight: 10,
          color: 'hsl(var(--muted-foreground))',
          fontSize: isMobile ? 13 : 14,
          fontWeight: 500,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: isMobile ? 12 : 13,
        },
        spotlight: {
          borderRadius: 16,
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Concluir',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  );
};
