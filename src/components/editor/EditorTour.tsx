import { useState } from 'react';
import Joyride, {
  CallBackProps,
  STATUS,
  Step,
  ACTIONS,
  EVENTS,
} from 'react-joyride';
import { markEditorTourCompleted, markOnboardingCompleted } from '@/lib/userApi';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditorTourProps {
  run: boolean;
  onFinish: () => void;
}

/**
 * PASSOS DESKTOP
 * Observação importante:
 * - Certifique-se de ter os data-tour-id abaixo nos componentes:
 *   - section-hero-header
 *   - section-hero-layout
 *   - section-hero-edit
 *   - section-hero-effects
 *   - editor-top-actions
 *   - lp-lgpd-settings (botão/aba de privacidade e cookies)
 */

const desktopTourSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-4">
        <h3 className="text-xl font-bold mb-2">Bem-vindo ao editor do noBRon</h3>
        <p className="text-muted-foreground">
          Este painel foi desenhado para você controlar cada seção da sua landing page
          com precisão. Vamos passar pelos pontos principais para garantir que você
          navegue com segurança e eficiência.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-header"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Estrutura da primeira seção</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você visualiza a estrutura da seção inicial da página. Ela concentra
          a mensagem principal e, normalmente, o primeiro call to action.
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
        <h4 className="font-semibold mb-1">Layout da seção</h4>
        <p className="text-sm text-muted-foreground">
          Neste controle você alterna o modelo visual da seção. A troca é aplicada
          em tempo real, reaproveitando o conteúdo já preenchido sempre que possível.
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
        <h4 className="font-semibold mb-1">Edição de conteúdo</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você altera textos, imagens e botões desta seção. Cada ajuste é salvo
          de forma estruturada para manter consistência entre modelos diferentes.
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
        <h4 className="font-semibold mb-1">Efeitos visuais avançados</h4>
        <p className="text-sm text-muted-foreground">
          Este painel concentra os efeitos visuais: fundos em glass, gradientes,
          animações e interações avançadas. Use com critério para reforçar percepção
          de valor sem comprometer performance.
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
        <h4 className="font-semibold mb-1">Ações principais do editor</h4>
        <p className="text-sm text-muted-foreground">
          Aqui você salva, publica, volta ao painel e gerencia ações críticas da
          página. Antes de publicar, valide seções, links e eventos de rastreamento.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    // NOVO STEP: LGPD / COOKIES
    target: '[data-tour-id="lp-lgpd-settings"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Privacidade, LGPD e cookies</h4>
        <p className="text-sm text-muted-foreground">
          Utilize este ponto para configurar banner de cookies, política de
          privacidade e consentimento. Essas definições impactam diretamente
          como os avisos aparecem na landing page e garantem conformidade
          regulatória mínima.
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
        <h3 className="text-xl font-bold mb-2">Tour concluído</h3>
        <p className="text-muted-foreground mb-3">
          A partir de agora, percorra a página e ajuste cada seção de acordo com a
          sua estratégia. Sempre que necessário, retorne às configurações gerais
          para revisar domínio, rastreamento e políticas.
        </p>
        <p className="text-xs text-muted-foreground">
          Observação: mantenha a página alinhada com LGPD, cookies e termos
          aplicáveis ao seu negócio.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
];

/**
 * TOUR MOBILE
 * Versão mais enxuta, mas ainda com step dedicado para LGPD/cookies.
 */

const mobileTourSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center py-3">
        <h3 className="text-lg font-bold mb-2">Visão geral do editor</h3>
        <p className="text-sm text-muted-foreground">
          Você pode editar textos, imagens e botões diretamente nas seções da página.
          Vamos passar rapidamente pelos pontos mais importantes.
        </p>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="section-hero-header"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1 text-sm">Seções editáveis</h4>
        <p className="text-xs text-muted-foreground">
          Em cada seção, use os botões de edição para ajustar conteúdo, layout e
          efeitos. A interface é otimizada para uso em tela menor, mas preserva
          as mesmas possibilidades do desktop.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="lp-lgpd-settings"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1 text-sm">Configurações de privacidade</h4>
        <p className="text-xs text-muted-foreground">
          Use este acesso para configurar cookies, política de privacidade e demais
          parâmetros de LGPD. Isso afeta diretamente como o banner de consentimento
          aparece para o visitante.
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
        <h3 className="text-lg font-bold mb-2">Configuração inicial concluída</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Continue rolando a página e ajuste cada seção conforme a proposta da
          sua landing page. Revise sempre os avisos de privacidade antes de
          publicar.
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
      scrollToFirstStep
      disableScrolling={false}
      spotlightPadding={6}
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
          boxShadow:
            '0 20px 50px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
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
