import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from '@/lib/lpContentApi';

const NONE_VALUE = 'none'; // 👈 sentinela pra "nenhuma LP"

const MasterHomepage = () => {
  const navigate = useNavigate();
  const [lps, setLPs] = useState<LandingPage[]>([]);
  const [currentHomeLpId, setCurrentHomeLpId] = useState<string | null>(null);

  // 👇 começa como "nenhuma"
  const [selectedLpId, setSelectedLpId] = useState<string>(NONE_VALUE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load all LPs publicadas
    const { data: lpsData } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('publicado', true)
      .order('nome', { ascending: true });

    if (lpsData) {
      setLPs(lpsData as LandingPage[]);
    }

    // Load current homepage setting
    const { data: settingData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'saas_home_lp_id')
      .maybeSingle();

    if (settingData?.value) {
      setCurrentHomeLpId(settingData.value);
      setSelectedLpId(settingData.value);
    } else {
      setCurrentHomeLpId(null);
      setSelectedLpId(NONE_VALUE);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // 👇 converte sentinela pra null
    const valueToSave =
      !selectedLpId || selectedLpId === NONE_VALUE ? null : selectedLpId;

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'saas_home_lp_id',
        value: valueToSave,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } else {
      // Log audit event
      await supabase.rpc('log_audit_event', {
        _action: 'set_homepage',
        _target_type: 'app_settings',
        _target_id: 'saas_home_lp_id',
        _details: { lp_id: valueToSave },
      });

      setCurrentHomeLpId(valueToSave);
      toast({
        title: 'Homepage atualizada!',
        description: 'A nova página inicial foi configurada.',
      });
    }

    setSaving(false);
  };

  const currentLP = lps.find((lp) => lp.id === currentHomeLpId);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Homepage noBRon</h1>
            <p className="text-xs text-muted-foreground">
              Configure a página inicial pública
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Current homepage status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Homepage Atual</CardTitle>
            <CardDescription>
              Esta é a LP que será exibida quando visitantes acessarem a raiz do site (/)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentLP ? (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {currentLP.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground">/{currentLP.slug}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/meu-site/${currentLP.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                Nenhuma homepage configurada. A página inicial mostrará um placeholder.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change homepage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alterar Homepage</CardTitle>
            <CardDescription>
              Selecione uma LP publicada para servir como página inicial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : (
              <>
                <div>
                  <Label>Landing Page</Label>
                  <Select
                    value={selectedLpId}
                    onValueChange={setSelectedLpId}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma LP" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* 👇 aqui NÃO pode ser value="" */}
                      <SelectItem value={NONE_VALUE}>
                        Nenhuma (usar placeholder)
                      </SelectItem>
                      {lps.map((lp) => (
                        <SelectItem key={lp.id} value={lp.id}>
                          {lp.nome} (/{lp.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas LPs publicadas aparecem nesta lista
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">Como funciona?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• A LP selecionada será renderizada na rota raiz (/)</li>
              <li>• Apenas admin_master pode alterar esta configuração</li>
              <li>• A LP deve estar publicada para aparecer na lista</li>
              <li>• Edite o conteúdo da homepage normalmente pelo editor</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MasterHomepage;
