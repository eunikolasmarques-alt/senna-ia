import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, DollarSign, Clock, MessageSquare, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PortalDashboard = () => {
  const navigate = useNavigate();
  const { client, token } = useClientAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <PortalLayout>
      <div className="space-y-8" data-testid="portal-dashboard">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {dashboardData?.client?.name || 'Cliente'}!
          </h1>
          <p className="text-zinc-400 mt-2">
            Bem-vindo ao seu portal. Aqui você pode acompanhar seus conteúdos, pagamentos e muito mais.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-600/50 transition-colors cursor-pointer"
                onClick={() => navigate('/portal/content')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Aguardando Aprovação</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    {stats.pending_approval || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="text-orange-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-600/50 transition-colors cursor-pointer"
                onClick={() => navigate('/portal/content')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Conteúdos Aprovados</p>
                  <p className="text-3xl font-bold text-emerald-500 mt-1">
                    {stats.approved_content || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="text-emerald-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-600/50 transition-colors cursor-pointer"
                onClick={() => navigate('/portal/payments')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Total Pago</p>
                  <p className="text-3xl font-bold text-blue-500 mt-1">
                    R$ {(stats.paid_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="text-blue-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-blue-600/50 transition-colors cursor-pointer"
                onClick={() => navigate('/portal/messages')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Mensagens Novas</p>
                  <p className="text-3xl font-bold text-violet-500 mt-1">
                    {stats.unread_messages || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <MessageSquare className="text-violet-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals Alert */}
          {stats.pending_approval > 0 && (
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-orange-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-500">Conteúdos Aguardando Sua Aprovação</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Você tem {stats.pending_approval} conteúdo{stats.pending_approval > 1 ? 's' : ''} aguardando revisão e aprovação.
                    </p>
                    <Button 
                      className="mt-4 bg-orange-500 hover:bg-orange-600"
                      onClick={() => navigate('/portal/content')}
                      data-testid="view-pending-content-btn"
                    >
                      Ver Conteúdos
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Alert */}
          {stats.pending_amount > 0 && (
            <Card className="bg-red-500/5 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-red-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-500">Pagamentos Pendentes</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Você tem R$ {stats.pending_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em pagamentos pendentes.
                    </p>
                    <Button 
                      className="mt-4 bg-red-500 hover:bg-red-600"
                      onClick={() => navigate('/portal/payments')}
                      data-testid="view-pending-payments-btn"
                    >
                      Ver Pagamentos
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All good message */}
          {stats.pending_approval === 0 && stats.pending_amount === 0 && (
            <Card className="bg-emerald-500/5 border-emerald-500/20 lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-emerald-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-500">Tudo em dia!</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Você não tem nenhum conteúdo pendente de aprovação e seus pagamentos estão em dia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contract Summary */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resumo do Contrato</CardTitle>
            <Button variant="ghost" onClick={() => navigate('/portal/contract')} data-testid="view-contract-btn">
              Ver Detalhes
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-zinc-500">Valor Mensal</p>
                <p className="text-xl font-bold text-blue-500 mt-1">
                  R$ {(dashboardData?.client?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total de Conteúdos</p>
                <p className="text-xl font-bold text-white mt-1">{stats.total_content || 0}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Conteúdos Aprovados</p>
                <p className="text-xl font-bold text-emerald-500 mt-1">{stats.approved_content || 0}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Segmento</p>
                <p className="text-xl font-bold text-white mt-1">{dashboardData?.client?.segment || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PortalDashboard;
