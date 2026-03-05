import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Target, TrendingUp, Users, Activity } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockGoals = [
    {
      id: '1',
      goal_type: 'Faturamento Mensal',
      target_value: 50000,
      current_value: 32400,
      period: 'Janeiro 2025',
      description: 'Meta de faturamento para o mês',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: '2',
      goal_type: 'Novos Clientes',
      target_value: 5,
      current_value: 3,
      period: 'Q1 2025',
      description: 'Aquisição de novos clientes no trimestre',
      icon: Users,
      color: '#06b6d4',
    },
    {
      id: '3',
      goal_type: 'Taxa de Retenção',
      target_value: 95,
      current_value: 92,
      period: '2025',
      description: 'Manter taxa de retenção acima de 95%',
      icon: Activity,
      color: '#7c3aed',
    },
    {
      id: '4',
      goal_type: 'Conteúdo Publicado',
      target_value: 120,
      current_value: 87,
      period: 'Janeiro 2025',
      description: 'Total de conteúdos publicados no mês',
      icon: Target,
      color: '#f97316',
    },
  ];

  const displayGoals = goals.length > 0 ? goals : mockGoals;

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
      <div className="space-y-8" data-testid="goals-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Metas e Planejamento</h1>
          <p className="text-base text-zinc-400">Acompanhe o progresso das metas da agência</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayGoals.map((goal) => {
            const Icon = goal.icon || Target;
            const percentage = (goal.current_value / goal.target_value) * 100;
            return (
              <Card key={goal.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`goal-card-${goal.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{goal.goal_type}</CardTitle>
                      <p className="text-sm text-zinc-500">{goal.period}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${goal.color}20` }}>
                      <Icon size={24} style={{ color: goal.color }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold" style={{ color: goal.color }}>
                        {goal.current_value.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-sm text-zinc-500">/ {goal.target_value.toLocaleString('pt-BR')}</span>
                    </div>
                    <Progress value={percentage} className="h-3" style={{ '--progress-color': goal.color }} />
                    <p className="text-xs text-zinc-500 mt-2">{percentage.toFixed(1)}% da meta atingida</p>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-zinc-400 pt-2 border-t border-zinc-800">{goal.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium">Reunião de Planejamento Q1</p>
                  <p className="text-sm text-zinc-500">Definir metas para o próximo trimestre</p>
                </div>
                <span className="text-sm text-zinc-400">15/01/2025</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                <div>
                  <p className="font-medium">Revisão de OKRs</p>
                  <p className="text-sm text-zinc-500">Avaliar progresso das metas atuais</p>
                </div>
                <span className="text-sm text-zinc-400">20/01/2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Goals;