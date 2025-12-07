/**
 * Painel de A/B Testing no Admin
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FlaskConical, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Trophy,
  BarChart3,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useABTest } from '@/hooks/useABTest';
import { SECTION_MODELS_BY_SECTION } from '@/lib/sectionModels';

interface ABTestPanelProps {
  lpId: string;
  userRole?: 'owner' | 'editor' | 'viewer';
}

const SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'beneficios', label: 'Benefícios' },
  { key: 'como_funciona', label: 'Como Funciona' },
  { key: 'provas_sociais', label: 'Provas Sociais' },
  { key: 'planos', label: 'Planos' },
  { key: 'chamada_final', label: 'Chamada Final' },
];

export const ABTestPanel = ({ lpId, userRole = 'viewer' }: ABTestPanelProps) => {
  const { tests, loading, createTest, updateTest, deleteTest } = useABTest(lpId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    section_key: 'hero',
    variant_a_id: '',
    variant_b_id: '',
    traffic_split: 50,
  });

  const canManage = userRole === 'owner' || userRole === 'editor';

  const handleCreate = async () => {
    if (!newTest.name || !newTest.variant_a_id || !newTest.variant_b_id) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const result = await createTest({
      lp_id: lpId,
      name: newTest.name,
      section_key: newTest.section_key,
      variant_a_id: newTest.variant_a_id,
      variant_b_id: newTest.variant_b_id,
      traffic_split: newTest.traffic_split,
      status: 'draft',
    });

    if (result) {
      toast({ title: 'Teste A/B criado!' });
      setShowCreateDialog(false);
      setNewTest({
        name: '',
        section_key: 'hero',
        variant_a_id: '',
        variant_b_id: '',
        traffic_split: 50,
      });
    } else {
      toast({ title: 'Erro ao criar teste', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const success = await updateTest(testId, { status: newStatus as any });
    
    if (success) {
      toast({ title: newStatus === 'active' ? 'Teste ativado!' : 'Teste pausado' });
    }
  };

  const handleDelete = async (testId: string) => {
    const success = await deleteTest(testId);
    if (success) {
      toast({ title: 'Teste excluído' });
    }
  };

  const getVariantsForSection = (sectionKey: string) => {
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    return models.map(m => ({
      id: m.id,
      name: m.name,
    }));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-success/10 text-success',
      paused: 'bg-warning/10 text-warning',
      completed: 'bg-primary/10 text-primary',
    };
    
    const labels = {
      draft: 'Rascunho',
      active: 'Ativo',
      paused: 'Pausado',
      completed: 'Concluído',
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Testes A/B</h3>
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
            {tests.length} teste{tests.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {canManage && (
          <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Teste
          </Button>
        )}
      </div>

      {/* Lista de testes */}
      {tests.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">Nenhum teste A/B</h4>
          <p className="text-sm text-muted-foreground">
            Crie testes para comparar diferentes versões das suas seções
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium truncate">{test.name}</h4>
                    {getStatusBadge(test.status)}
                    {test.winner_variant && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">
                        <Trophy className="w-3 h-3" />
                        Vencedor: {test.winner_variant === test.variant_a_id ? 'A' : 'B'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Seção: <strong>{test.section_key}</strong></span>
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Split: {test.traffic_split}% / {100 - test.traffic_split}%
                    </span>
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700">
                      <span className="font-bold">A:</span> {test.variant_a_id}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-700">
                      <span className="font-bold">B:</span> {test.variant_b_id}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(test.id, test.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        test.status === 'active'
                          ? 'hover:bg-warning/10 text-warning'
                          : 'hover:bg-success/10 text-success'
                      }`}
                      title={test.status === 'active' ? 'Pausar' : 'Ativar'}
                    >
                      {test.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog de criação */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Teste A/B</DialogTitle>
            <DialogDescription>
              Compare duas variantes de layout para descobrir qual converte melhor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>Nome do Teste</Label>
              <Input
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                placeholder="Ex: Teste Hero v1 vs v2"
              />
            </div>

            <div>
              <Label>Seção</Label>
              <Select
                value={newTest.section_key}
                onValueChange={(v) => setNewTest({ 
                  ...newTest, 
                  section_key: v,
                  variant_a_id: '',
                  variant_b_id: '',
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map(s => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Variante A</Label>
                <Select
                  value={newTest.variant_a_id}
                  onValueChange={(v) => setNewTest({ ...newTest, variant_a_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getVariantsForSection(newTest.section_key).map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variante B</Label>
                <Select
                  value={newTest.variant_b_id}
                  onValueChange={(v) => setNewTest({ ...newTest, variant_b_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getVariantsForSection(newTest.section_key).map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Distribuição de Tráfego (% para Variante A)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={newTest.traffic_split}
                  onChange={(e) => setNewTest({ ...newTest, traffic_split: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-20 text-center">
                  {newTest.traffic_split}% / {100 - newTest.traffic_split}%
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Criar Teste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ABTestPanel;
