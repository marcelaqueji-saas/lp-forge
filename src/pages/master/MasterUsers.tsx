import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Shield, User, Zap, Crown, 
  MoreVertical, RefreshCw, ChevronDown, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserPlan,
  UserWithDetails,
  AppRole,
  PlanTier 
} from '@/lib/authApi';
import { useAuth } from '@/hooks/useAuth';

const MasterUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      const success = await updateUserRole(userId, newRole);
      if (success) {
        toast({ title: 'Role atualizada com sucesso' });
        loadUsers();
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handlePlanChange = async (userId: string, newPlan: PlanTier) => {
    const success = await updateUserPlan(userId, newPlan);
    if (success) {
      toast({ title: 'Plano atualizado com sucesso' });
      loadUsers();
    } else {
      toast({ title: 'Erro ao atualizar plano', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
    return matchesSearch && matchesRole && matchesPlan;
  });

  const getRoleBadge = (role: AppRole) => {
    if (role === 'admin_master') {
      return <Badge className="bg-primary/20 text-primary border-0"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    }
    return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Cliente</Badge>;
  };

  const getPlanBadge = (plan: PlanTier) => {
    const icons = { free: Zap, pro: Zap, premium: Crown };
    const colors = { 
      free: 'bg-muted text-muted-foreground', 
      pro: 'bg-primary/20 text-primary', 
      premium: 'bg-accent/20 text-accent' 
    };
    const Icon = icons[plan];
    return <Badge className={`${colors[plan]} border-0`}><Icon className="w-3 h-3 mr-1" />{plan}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Gestão de Usuários</h1>
            <p className="text-xs text-muted-foreground">{users.length} usuários cadastrados</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas roles</SelectItem>
              <SelectItem value="admin_master">Admin Master</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos planos</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado</div>
          ) : (
            filteredUsers.map((u) => (
              <div 
                key={u.id} 
                className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{u.display_name || 'Sem nome'}</h3>
                    {getRoleBadge(u.role)}
                    {getPlanBadge(u.plan)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" />
                      {u.lp_count} LPs
                    </span>
                    <span>{u.storage_used_mb} MB usado</span>
                    {u.last_login_at && (
                      <span>Último acesso: {new Date(u.last_login_at).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ações <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => handleRoleChange(u.id, u.role === 'admin_master' ? 'client' : 'admin_master')}
                      disabled={u.id === user?.id}
                    >
                      {u.role === 'admin_master' ? 'Rebaixar para Cliente' : 'Promover a Admin'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePlanChange(u.id, 'free')}>
                      Definir plano Free
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlanChange(u.id, 'pro')}>
                      Definir plano Pro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlanChange(u.id, 'premium')}>
                      Definir plano Premium
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MasterUsers;
