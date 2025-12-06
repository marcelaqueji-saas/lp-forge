import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  database?: string;
  version?: string;
  error?: string;
}

const Health = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('health');
        
        if (error) {
          setHealth({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
          });
        } else {
          setHealth(data);
        }
      } catch (err: any) {
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: err.message
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <pre className="text-sm">{"{ \"status\": \"checking...\" }"}</pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <pre className="text-sm p-4 rounded-lg bg-muted">
        {JSON.stringify(health, null, 2)}
      </pre>
    </div>
  );
};

export default Health;