import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Plus, AlertCircle, CheckCircle, Clock, TrendingUp, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DeliveryDashboard = ({ clients, users }) => {
  const [deliveryGoals, setDeliveryGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    client_id: '',
    month: new Date().toLocaleString('pt-BR', { month: 'long' }),
    year: new Date().getFullYear(),
    total_posts_required: 0,
    total_reels_required: 0,
    total_stories_required: 0,
    deadline_date: '',
    responsible_posts: '',
    responsible_reels: '',
    responsible_stories: '',
  });

  useEffect(() => {
    fetchDeliveryGoals();
  }, []);

  const fetchDeliveryGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/delivery-goals`);
      setDeliveryGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch delivery goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/delivery-goals`, newGoal);
      toast.success('Meta de entrega criada com sucesso!');
      setIsDialogOpen(false);
      fetchDeliveryGoals();
      setNewGoal({
        client_id: '',
        month: new Date().toLocaleString('pt-BR', { month: 'long' }),
        year: new Date().getFullYear(),
        total_posts_required: 0,
        total_reels_required: 0,
        total_stories_required: 0,
        deadline_date: '',
        responsible_posts: '',
        responsible_reels: '',
        responsible_stories: '',
      });
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Erro ao criar meta');
    }
  };

  const handleUpdateProgress = async (goalId) => {
    try {
      const response = await axios.post(`${API_URL}/delivery-goals/${goalId}/update-progress`);
      toast.success('Progresso atualizado!');
      fetchDeliveryGoals();
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Erro ao atualizar progresso');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Não atribuído';
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Concluído': {
        color: '#10b981',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        textColor: 'text-emerald-500',
        icon: CheckCircle,
      },
      'Com Tempo': {
        color: '#06b6d4',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        textColor: 'text-cyan-500',
        icon: TrendingUp,
      },
      'Em Progresso': {
        color: '#eab308',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        textColor: 'text-yellow-500',
        icon: Clock,
      },
      'Crítico': {
        color: '#f97316',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        textColor: 'text-orange-500',
        icon: AlertCircle,
      },
      'Atrasado': {
        color: '#ef4444',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        textColor: 'text-red-500',
        icon: AlertCircle,
      },
    };
    return configs[status] || configs['Em Progresso'];
  };

  if (loading) {
    return <div className="text-center py-8 text-zinc-500">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6" data-testid="delivery-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Entregas Mensais</h2>
          <p className="text-sm text-zinc-500">Acompanhe o progresso das entregas por cliente</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700" data-testid="add-delivery-goal">
              <Plus className="mr-2" size={20} />
              Nova Meta de Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurar Meta de Entrega Mensal</DialogTitle>
              <DialogDescription>Defina as entregas obrigatórias para o cliente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="client_id">Cliente</Label>
                  <select
                    id="client_id"
                    data-testid="goal-client-select"
                    value={newGoal.client_id}
                    onChange={(e) => setNewGoal({ ...newGoal, client_id: e.target.value })}
                    required
                    className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="deadline_date">Data Limite</Label>
                  <Input
                    id="deadline_date"
                    type="date"
                    value={newGoal.deadline_date}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline_date: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm">Posts Feed</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_posts">Quantidade Obrigatória</Label>
                    <Input
                      id="total_posts"
                      type="number"
                      min="0"
                      value={newGoal.total_posts_required}
                      onChange={(e) => setNewGoal({ ...newGoal, total_posts_required: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible_posts">Responsável</Label>
                    <select
                      id="responsible_posts"
                      value={newGoal.responsible_posts}
                      onChange={(e) => setNewGoal({ ...newGoal, responsible_posts: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm">Reels</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_reels">Quantidade Obrigatória</Label>
                    <Input
                      id="total_reels"
                      type="number"
                      min="0"
                      value={newGoal.total_reels_required}
                      onChange={(e) => setNewGoal({ ...newGoal, total_reels_required: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible_reels">Responsável</Label>
                    <select
                      id="responsible_reels"
                      value={newGoal.responsible_reels}
                      onChange={(e) => setNewGoal({ ...newGoal, responsible_reels: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm">Stories</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_stories">Quantidade Obrigatória</Label>
                    <Input
                      id="total_stories"
                      type="number"
                      min="0"
                      value={newGoal.total_stories_required}
                      onChange={(e) => setNewGoal({ ...newGoal, total_stories_required: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible_stories">Responsável</Label>
                    <select
                      id="responsible_stories"
                      value={newGoal.responsible_stories}
                      onChange={(e) => setNewGoal({ ...newGoal, responsible_stories: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                Criar Meta de Entrega
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryGoals.map((goal) => {
          const statusConfig = getStatusConfig(goal.status);
          const StatusIcon = statusConfig.icon;
          const totalRequired = goal.total_posts_required + goal.total_reels_required + goal.total_stories_required;
          const totalDelivered = goal.posts_delivered + goal.reels_delivered + goal.stories_delivered;

          return (
            <Card key={goal.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`delivery-goal-${goal.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{getClientName(goal.client_id)}</CardTitle>
                    <p className="text-sm text-zinc-500">{goal.month} {goal.year}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}>
                    <StatusIcon size={14} />
                    {goal.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso Geral</span>
                    <span className="text-2xl font-bold" style={{ color: statusConfig.color }}>
                      {goal.percentage}%
                    </span>
                  </div>
                  <Progress value={goal.percentage} className="h-3" style={{ '--progress-color': statusConfig.color }} />
                  <p className="text-xs text-zinc-600 mt-1">
                    {totalDelivered} de {totalRequired} entregas concluídas
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  {goal.total_posts_required > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        <span className="text-zinc-400">Posts Feed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {goal.posts_delivered}/{goal.total_posts_required}
                        </span>
                        {goal.responsible_posts && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <User size={12} />
                            {getUserName(goal.responsible_posts)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {goal.total_reels_required > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-zinc-400">Reels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {goal.reels_delivered}/{goal.total_reels_required}
                        </span>
                        {goal.responsible_reels && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <User size={12} />
                            {getUserName(goal.responsible_reels)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {goal.total_stories_required > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span className="text-zinc-400">Stories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {goal.stories_delivered}/{goal.total_stories_required}
                        </span>
                        {goal.responsible_stories && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <User size={12} />
                            {getUserName(goal.responsible_stories)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Calendar size={14} />
                    <span>
                      {goal.days_remaining >= 0 ? `${goal.days_remaining} dias restantes` : `${Math.abs(goal.days_remaining)} dias atrasado`}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleUpdateProgress(goal.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid={`update-progress-${goal.id}`}
                  >
                    Atualizar Progresso
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {deliveryGoals.length === 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto text-zinc-600 mb-4" size={48} />
            <p className="text-zinc-500 mb-4">Nenhuma meta de entrega cadastrada</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="mr-2" size={20} />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryDashboard;
