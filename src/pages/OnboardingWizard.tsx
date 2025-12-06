import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// This page now redirects to onboarding - the actual wizard is at /meu-site/:lpId/construtor
const OnboardingWizard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect back to onboarding to pick the right flow
    navigate('/onboarding');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default OnboardingWizard;
