import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, Users, FileText, CheckCircle, Clock } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueData = [
    { month: 'Jul', revenue: 28000 },
    { month: 'Ago', revenue: 32000 },
    { month: 'Set', revenue: 35000 },
    { month: 'Out', revenue: 31000 },
    { month: 'Nov', revenue: 38000 },
    { month: 'Dez', revenue: 42000 },
  ];

  const distributionData = [
    { name: 'Cliente A', value: 12000, color: '#7c3aed' },
    { name: 'Cliente B', value: 8500, color: '#06b6d4' },
    { name: 'Cliente C', value: 6800, color: '#10b981' },
    { name: 'Cliente D', value: 5200, color: '#f97316' },
    { name: 'Outros', value: 9500, color: '#ec4899' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
        </div>
      </Layout>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
            {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-base text-zinc-400">Visão geral do desempenho da agência</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title="Receita Total"
            value={`R$ ${stats?.total_revenue?.toLocaleString('pt-BR') || '0'}`}
            subtitle="No mês atual"
            color="#10b981"
          />
          <StatCard
            icon={TrendingUp}
            title="Receita Prevista"
            value={`R$ ${stats?.projected_revenue?.toLocaleString('pt-BR') || '0'}`}
            subtitle="Contratos ativos"
            color="#06b6d4"
          />
          <StatCard
            icon={AlertCircle}
            title="Inadimplência"
            value={`R$ ${stats?.overdue_amount?.toLocaleString('pt-BR') || '0'}`}
            subtitle="Pagamentos em atraso"
            color="#f97316"
          />
          <StatCard
            icon={Users}
            title="Clientes Ativos"
            value={stats?.active_clients || '0'}
            subtitle={`Ticket médio: R$ ${stats?.average_ticket?.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) || '0'}`}
            color="#7c3aed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f4f4f5' }}
                  />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Distribuição por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={(entry) => `R$ ${entry.value.toLocaleString('pt-BR')}`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="text-violet-500" size={20} />
                Conteúdo Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-violet-500">{stats?.active_content || 0}</p>
              <p className="text-sm text-zinc-500 mt-1">Em produção ou revisão</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                Aguardando Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-500">{stats?.pending_approvals || 0}</p>
              <p className="text-sm text-zinc-500 mt-1">Pendente de cliente</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="text-cyan-500" size={20} />
                Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-cyan-500">{stats?.team_members || 0}</p>
              <p className="text-sm text-zinc-500 mt-1">Colaboradores ativos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;