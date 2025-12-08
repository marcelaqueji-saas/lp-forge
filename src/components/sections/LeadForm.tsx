import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { saveLead, verifyCaptcha } from '@/lib/lpContentApi';
import { getUTMParams } from '@/lib/utm';
import { trackLeadSubmit, trackSectionView } from '@/lib/tracking';
import { toast } from '@/hooks/use-toast';

interface LeadFormProps {
  lpId: string;
  onSuccess?: () => void;
  captchaProvider?: 'hcaptcha' | null;
  captchaSiteKey?: string;
}

// Simple rate limiting on client side
const RATE_LIMIT_KEY = 'lead_form_submissions';
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_SUBMISSIONS = 3;

const checkClientRateLimit = (): boolean => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (!stored) return true;

  try {
    const data = JSON.parse(stored);
    const now = Date.now();
    const validSubmissions = data.filter(
      (time: number) => now - time < RATE_LIMIT_WINDOW
    );
    return validSubmissions.length < MAX_SUBMISSIONS;
  } catch {
    return true;
  }
};

const recordSubmission = () => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const now = Date.now();

  let data: number[] = [];
  if (stored) {
    try {
      data = JSON.parse(stored).filter(
        (time: number) => now - time < RATE_LIMIT_WINDOW
      );
    } catch {
      data = [];
    }
  }

  data.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
};

// Generate a simple math challenge for anti-bot
const generateMathChallenge = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
};

export const LeadForm = ({
  lpId,
  onSuccess,
  captchaProvider,
  captchaSiteKey,
}: LeadFormProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [formError, setFormError] = useState('');

  // Simple math captcha
  const [mathChallenge, setMathChallenge] = useState(generateMathChallenge);
  const [mathAnswer, setMathAnswer] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const isCaptchaEnabled = captchaProvider === 'hcaptcha' && captchaSiteKey;

  // Ref para rastrear visualização da seção (section_view)
  const formRef = useRef<HTMLFormElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return;
    if (hasTrackedViewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'lead_form');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId]);

  // hCaptcha via iframe (external script approach)
  useEffect(() => {
    if (isCaptchaEnabled && captchaSiteKey) {
      // Load hCaptcha script dynamically
      const existingScript = document.getElementById('hcaptcha-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'hcaptcha-script';
        script.src = 'https://js.hcaptcha.com/1/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, [isCaptchaEnabled, captchaSiteKey]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (basic)
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s\-\(\)\+]{8,20}$/;
    return phoneRegex.test(phone);
  };

  const handleMathCaptchaCheck = () => {
    const userAnswer = parseInt(mathAnswer, 10);
    if (userAnswer === mathChallenge.answer) {
      setCaptchaVerified(true);
      setFormError('');
    } else {
      setFormError('Resposta incorreta. Tente novamente.');
      setMathChallenge(generateMathChallenge());
      setMathAnswer('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Honeypot check (bot detection)
    if (honeypot) {
      console.log('Bot detected');
      return;
    }

    // Client-side rate limiting
    if (!checkClientRateLimit()) {
      setFormError(
        'Você enviou muitas solicitações. Aguarde alguns minutos.'
      );
      return;
    }

    if (!email) {
      toast({
        title: 'Por favor, preencha o email',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      setFormError('Por favor, insira um email válido');
      return;
    }

    if (!validatePhone(telefone)) {
      setFormError('Por favor, insira um telefone válido');
      return;
    }

    // Check math captcha if enabled
    if (isCaptchaEnabled && !captchaVerified) {
      setFormError('Por favor, complete a verificação de segurança.');
      return;
    }

    setLoading(true);

    try {
      // Get hCaptcha token if available
      let captchaToken: string | null = null;
      if (isCaptchaEnabled) {
        const hcaptchaResponse = (window as any).hcaptcha?.getResponse?.();
        if (hcaptchaResponse) {
          captchaToken = hcaptchaResponse;
          const captchaValid = await verifyCaptcha(lpId, captchaToken);
          if (!captchaValid) {
            setFormError(
              'Verificação de segurança inválida. Tente novamente.'
            );
            (window as any).hcaptcha?.reset?.();
            setLoading(false);
            return;
          }
        }
      }

      const utm = getUTMParams();
      const result = await saveLead(
        lpId,
        {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
        },
        utm
      );

      if (result.success) {
        recordSubmission();

        // ✅ Tracking novo: lead_submit first-party
        trackLeadSubmit(lpId, 'lead_form');

        toast({
          title: 'Obrigado!',
          description: 'Entraremos em contato em breve.',
        });
        setNome('');
        setEmail('');
        setTelefone('');
        setCaptchaVerified(false);
        setMathChallenge(generateMathChallenge());
        setMathAnswer('');
        (window as any).hcaptcha?.reset?.();
        onSuccess?.();
      } else if (result.error === 'rate_limit') {
        setFormError(
          'Você já se cadastrou recentemente. Aguarde alguns minutos.'
        );
      } else {
        toast({
          title: 'Erro ao enviar',
          description: 'Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold mb-4">Receba mais informações</h3>

      {/* Honeypot field - hidden from users, visible to bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
          maxLength={100}
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Seu email *"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFormError('');
          }}
          required
          className="input-field"
          maxLength={255}
        />
      </div>

      <div>
        <input
          type="tel"
          placeholder="Seu telefone"
          value={telefone}
          onChange={(e) => {
            setTelefone(e.target.value);
            setFormError('');
          }}
          className="input-field"
          maxLength={20}
        />
      </div>

      {/* Captcha section */}
      {isCaptchaEnabled && (
        <div className="space-y-3">
          {/* hCaptcha widget container */}
          {captchaSiteKey && (
            <div
              className="h-captcha flex justify-center"
              data-sitekey={captchaSiteKey}
              data-theme="light"
            />
          )}

          {/* Fallback math captcha */}
          {!captchaVerified && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verificação de segurança
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Quanto é {mathChallenge.a} + {mathChallenge.b}?
                </span>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  className="input-field w-20 text-center"
                  placeholder="?"
                />
                <button
                  type="button"
                  onClick={handleMathCaptchaCheck}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Verificar
                </button>
              </div>
            </div>
          )}

          {captchaVerified && (
            <div className="flex items-center gap-2 text-sm text-success p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="w-4 h-4" />
              Verificado
            </div>
          )}
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (isCaptchaEnabled && !captchaVerified)}
        className="btn-primary w-full gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Enviar
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Seus dados estão protegidos
      </p>
    </motion.form>
  );
};
