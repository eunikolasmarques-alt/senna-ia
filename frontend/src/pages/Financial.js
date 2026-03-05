import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Financial = () => {
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/payments`),
      ]);
      setClients(clientsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.amount, 0);
  const projectedRevenue = clients.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + c.monthly_value, 0);
  const overdueAmount = payments.filter(p => p.status === 'Em atraso').reduce((sum, p) => sum + p.amount, 0);
  const averageTicket = projectedRevenue / clients.filter(c => c.status === 'Ativo').length || 0;

  const revenueByClient = clients
    .filter(c => c.status === 'Ativo')
    .map(c => ({
      name: c.name,
      value: c.monthly_value,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const monthlyData = [
    { month: 'Jul', revenue: 28000, goal: 35000 },
    { month: 'Ago', revenue: 32000, goal: 35000 },
    { month: 'Set', revenue: 35000, goal: 35000 },
    { month: 'Out', revenue: 31000, goal: 35000 },
    { month: 'Nov', revenue: 38000, goal: 40000 },
    { month: 'Dez', revenue: 42000, goal: 40000 },
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

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
            {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
                <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {Math.abs(trend)}% vs mês anterior
                </span>
              </div>
            )}
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
      <div className="space-y-8" data-testid="financial-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Painel Financeiro</h1>
          <p className="text-base text-zinc-400">Acompanhe a saúde financeira da agência</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title="Receita Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
            subtitle="No mês atual"
            trend={12.5}
            color="#10b981"
          />
          <StatCard
            icon={TrendingUp}
            title="Receita Prevista"
            value={`R$ ${projectedRevenue.toLocaleString('pt-BR')}`}
            subtitle="Contratos ativos"
            color="#06b6d4"
          />
          <StatCard
            icon={AlertCircle}
            title="Inadimplência"
            value={`R$ ${overdueAmount.toLocaleString('pt-BR')}`}
            subtitle="Pagamentos em atraso"
            trend={-5.2}
            color="#f97316"
          />
          <StatCard
            icon={DollarSign}
            title="Ticket Médio"
            value={`R$ ${averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            subtitle="Por cliente"
            color="#7c3aed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Receita Mensal vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f4f4f5' }}
                  />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[8, 8, 0, 0]} name="Receita" />
                  <Bar dataKey="goal" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Distribuição de Receita por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={revenueByClient}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {revenueByClient.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#7c3aed', '#06b6d4', '#10b981', '#f97316', '#ec4899', '#eab308', '#8b5cf6', '#3b82f6'][index % 8]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Clientes - Status Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Valor Mensal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Vencimento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.filter(c => c.status === 'Ativo').map((client) => (
                    <tr key={client.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-emerald-500 font-semibold">
                        R$ {client.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">Todo dia {client.due_day}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Em dia
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{client.margin || 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Financial;