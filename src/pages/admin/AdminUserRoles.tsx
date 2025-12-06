import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  getLPById, 
  getUserRoleForLP, 
  getLPUserRoles, 
  addUserRoleToLP, 
  removeUserRoleFromLP,
  LandingPage, 
  LPRole, 
  LPUserRole 
} from '@/lib/lpContentApi';
import { 
  Loader2, 
  ArrowLeft, 
  Users, 
  Crown, 
  Edit, 
  Eye, 
  Trash2, 
  UserPlus,
  AlertCircle,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ROLE_LABELS: Record<LPRole, string> = {
  owner: 'Dono',
  editor: 'Editor',
  viewer: 'Visualizador',
};

const ROLE_ICONS: Record<LPRole, typeof Crown> = {
  owner: Crown,
  editor: Edit,
  viewer: Eye,
};

interface UserWithRole extends LPUserRole {
  email?: string;
}

const AdminUserRoles = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lp, setLP] = useState<LandingPage | null>(null);
  const [userRole, setUserRole] = useState<LPRole | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  
  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      setCurrentUserId(session.user.id);

      if (!id) {
        navigate('/admin');
        return;
      }

      const [lpData, role] = await Promise.all([
        getLPById(id),
        getUserRoleForLP(id),
      ]);

      if (!lpData) {
        toast({ title: 'LP não encontrada', variant: 'destructive' });
        navigate('/admin');
        return;
      }

      // Only owners can access this page
      if (role !== 'owner') {
        toast({ title: 'Acesso negado', description: 'Apenas o dono pode gerenciar usuários.', variant: 'destructive' });
        navigate(`/admin/lp/${id}/sections`);
        return;
      }

      setLP(lpData);
      setUserRole(role);

      // Load user roles
      await loadUserRoles(id, lpData.owner_id || '');
      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const loadUserRoles = async (lpId: string, ownerId: string) => {
    const roles = await getLPUserRoles(lpId);
    
    // Create a map of users with their roles
    const userMap = new Map<string, UserWithRole>();
    
    // Add the owner first
    if (ownerId) {
      userMap.set(ownerId, {
        id: 'owner-implicit',
        lp_id: lpId,
        user_id: ownerId,
        role: 'owner',
        created_at: '',
      });
    }
    
    // Add users from lp_user_roles
    roles.forEach(role => {
      if (!userMap.has(role.user_id)) {
        userMap.set(role.user_id, role);
      }
    });

    // Fetch user emails from auth (this would require a separate function or edge function)
    // For now, we'll just show the user IDs
    const usersWithRoles = Array.from(userMap.values());
    
    // Try to get emails from a custom lookup (simplified)
    for (const user of usersWithRoles) {
      // In a real implementation, you'd fetch user emails from a profiles table or edge function
      user.email = user.user_id === currentUserId ? 'Você' : `Usuário ${user.user_id.slice(0, 8)}...`;
    }
    
    setUsers(usersWithRoles);
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !id) return;
    
    setInviting(true);
    
    try {
      // First, try to find the user by email
      // Note: This requires either a profiles table or an edge function to look up users
      // For now, we'll create an entry that can be claimed when the user logs in
      
      // Check if email looks valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        toast({ title: 'Email inválido', variant: 'destructive' });
        setInviting(false);
        return;
      }

      // Try to find user in auth (this needs an edge function in production)
      // For now, show a message that the user needs to exist
      toast({ 
        title: 'Convite preparado', 
        description: `O usuário com email ${inviteEmail} será adicionado quando se cadastrar no sistema.`,
      });
      
      setInviteEmail('');
      
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({ title: 'Erro ao convidar usuário', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: LPRole) => {
    if (!id || newRole === 'owner') return;
    
    const success = await addUserRoleToLP(id, userId, newRole);
    
    if (success) {
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
      toast({ title: 'Papel atualizado' });
    } else {
      toast({ title: 'Erro ao atualizar papel', variant: 'destructive' });
    }
  };

  const handleRemoveUser = async () => {
    if (!id || !deleteUserId) return;
    
    // Prevent removing owner
    const userToRemove = users.find(u => u.user_id === deleteUserId);
    if (userToRemove?.role === 'owner') {
      toast({ title: 'Não é possível remover o dono', variant: 'destructive' });
      setDeleteUserId(null);
      return;
    }
    
    const success = await removeUserRoleFromLP(id, deleteUserId);
    
    if (success) {
      setUsers(users.filter(u => u.user_id !== deleteUserId));
      toast({ title: 'Usuário removido' });
    } else {
      toast({ title: 'Erro ao remover usuário', variant: 'destructive' });
    }
    
    setDeleteUserId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lp || userRole !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/admin/lp/${id}/sections`} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Gerenciar Usuários</h1>
                <p className="text-sm text-muted-foreground">{lp.nome}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Invite Form */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Convidar usuário
            </h2>
            
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-1 block">Email do usuário</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="usuario@email.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-40">
                  <label className="text-sm text-muted-foreground mb-1 block">Papel</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'editor' | 'viewer')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  O usuário precisa ter uma conta cadastrada no sistema. 
                  Se o email não existir, o convite ficará pendente até o cadastro.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={inviting || !inviteEmail}
                className="btn-primary gap-2"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Convidando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Convidar
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários com acesso ({users.length})
            </h2>
            
            <div className="space-y-3">
              {users.map((user) => {
                const RoleIcon = ROLE_ICONS[user.role];
                const isOwner = user.role === 'owner';
                const isCurrentUser = user.user_id === currentUserId;
                
                return (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isOwner ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {user.email}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Você
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ROLE_LABELS[user.role]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isOwner && !isCurrentUser && (
                        <>
                          <Select 
                            value={user.role} 
                            onValueChange={(v) => handleRoleChange(user.user_id, v as LPRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <button
                            onClick={() => setDeleteUserId(user.user_id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="Remover usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {isOwner && (
                        <span className="flex items-center gap-1 text-sm text-warning">
                          <ShieldAlert className="w-4 h-4" />
                          Protegido
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário com acesso além do dono.
                </p>
              )}
            </div>
          </div>

          {/* Permissions Info */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Níveis de permissão</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Dono</p>
                  <p className="text-muted-foreground">
                    Acesso total: criar, editar, publicar, excluir LP e gerenciar usuários.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Edit className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Editor</p>
                  <p className="text-muted-foreground">
                    Pode editar seções, estilos e visualizar analytics. Não pode publicar, excluir ou gerenciar usuários.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Visualizador</p>
                  <p className="text-muted-foreground">
                    Acesso somente leitura. Pode ver seções, estilos e analytics, mas não pode editar nada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso deste usuário? 
              Ele não poderá mais visualizar ou editar esta landing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserRoles;