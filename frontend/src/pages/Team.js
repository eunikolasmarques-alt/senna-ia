import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, Briefcase, Calendar, ShieldCheck, ChevronDown, ChevronUp, Save, LayoutDashboard, Users, FileText, TrendingUp, UserPlus, Target, BarChart3, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ALL_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'clientes', label: 'Clientes', icon: Briefcase },
  { key: 'conteudo', label: 'Conteúdo', icon: FileText },
  { key: 'financeiro', label: 'Financeiro', icon: TrendingUp },
  { key: 'leads', label: 'CRM Leads', icon: UserPlus },
  { key: 'colaboradores', label: 'Colaboradores', icon: Users },
  { key: 'metas', label: 'Metas', icon: Target },
  { key: 'midia-paga', label: 'Mídia Paga', icon: BarChart3 },
  { key: 'insights', label: 'Insights', icon: BarChart3 },
  { key: 'documentos-internos', label: 'Docs Internos', icon: FolderOpen },
];

const PermissionPanel = ({ user: collaborator, onSave }) => {
  const [open, setOpen] = useState(false);
  // null = acesso total (padrão); array = somente esses
  const [permissions, setPermissions] = useState(
    collaborator.tab_permissions ?? null
  );
  const [saving, setSaving] = useState(false);

  const isFullAccess = permissions === null;

  const toggle = (key) => {
    if (permissions === null) {
      // Switch from "tudo" para lista sem este item
      setPermissions(ALL_TABS.map(t => t.key).filter(k => k !== key));
    } else if (permissions.includes(key)) {
      setPermissions(permissions.filter(k => k !== key));
    } else {
      const next = [...permissions, key];
      // Se todos estão selecionados, voltar para null (tudo)
      if (next.length === ALL_TABS.length) setPermissions(null);
      else setPermissions(next);
    }
  };

  const toggleAll = () => {
    setPermissions(isFullAccess ? [] : null);
  };

  const hasAccess = (key) => {
    if (permissions === null) return true;
    return permissions.includes(key);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/users/${collaborator.id}/permissions`, {
        tab_permissions: permissions
      });
      toast.success(`Permissões de ${collaborator.name} salvas!`);
      onSave(collaborator.id, permissions);
    } catch (e) {
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} />
          Gerenciar Permissões de Abas
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Toggle geral */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span>Acesso às abas</span>
            <button
              onClick={toggleAll}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isFullAccess
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {isFullAccess ? '✓ Acesso total' : 'Acesso personalizado'}
            </button>
          </div>

          {/* Grid de toggles */}
          <div className="grid grid-cols-2 gap-2">
            {ALL_TABS.map((tab) => {
              const IconComp = tab.icon;
              const active = hasAccess(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => toggle(tab.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 border-blue-600/30'
                      : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${active ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                    {active ? '✓' : ''}
                  </div>
                  <IconComp size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
          >
            <Save size={14} className="mr-2" />
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </div>
      )}
    </div>
  );
};

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser && (
    currentUser.role === 'Admin' ||
    currentUser.role === 'Sócio' ||
    currentUser.role === 'Admin/Sócio'
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionSave = (userId, newPermissions) => {
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, tab_permissions: newPermissions } : u)
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      'Sócio': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      'Admin/Sócio': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      'Gerente de Contas': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Social Media': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Designer': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Gestor de Tráfego': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Financeiro': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return colors[role] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="team-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Colaboradores</h1>
          <p className="text-base text-zinc-400">
            {isAdmin
              ? 'Gerencie a equipe e controle as permissões de cada colaborador'
              : 'Conheça a equipe da agência'
            }
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl text-sm text-blue-400">
            <ShieldCheck size={18} />
            <span>
              Como administrador, você pode expandir o card de cada colaborador para controlar quais abas ele tem acesso.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => {
            const isCurrentAdmin = u.role === 'Admin' || u.role === 'Sócio' || u.role === 'Admin/Sócio';
            return (
              <Card key={u.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`user-card-${u.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-white mb-1">{u.name}</h3>
                        {isCurrentAdmin && <ShieldCheck size={14} className="text-violet-400 mb-1" />}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Mail size={16} />
                      <span>{u.email}</span>
                    </div>
                    {u.department && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Briefcase size={16} />
                        <span>{u.department}</span>
                      </div>
                    )}
                    {u.admission_date && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Calendar size={16} />
                        <span>Desde {new Date(u.admission_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {/* Acesso atual */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <ShieldCheck size={13} />
                      <span>
                        {isCurrentAdmin
                          ? 'Acesso total (Admin)'
                          : u.tab_permissions === null || u.tab_permissions === undefined
                          ? 'Acesso total'
                          : u.tab_permissions.length === 0
                          ? 'Sem acesso configurado'
                          : `${u.tab_permissions.length} aba(s) liberada(s)`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Painel de permissões — somente para admin, e não para outros admins */}
                  {isAdmin && !isCurrentAdmin && u.id !== currentUser?.id && (
                    <PermissionPanel
                      user={u}
                      onSave={handlePermissionSave}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Team;
