import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PortalPayments = () => {
  const { token } = useClientAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pago': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Pendente': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Em atraso': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || colors['Pendente'];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pago':
        return <CheckCircle className="text-emerald-500" size={20} />;
      case 'Em atraso':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-orange-500" size={20} />;
    }
  };

  const totalPaid = payments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'Em atraso').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-8" data-testid="portal-payments-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-zinc-400 mt-2">
            Acompanhe o histórico de pagamentos do seu contrato.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Total Pago</p>
                  <p className="text-3xl font-bold text-emerald-500 mt-1">
                    R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="text-emerald-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Pendente</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">
                    R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="text-orange-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Em Atraso</p>
                  <p className="text-3xl font-bold text-red-500 mt-1">
                    R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="text-red-500" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {totalOverdue > 0 && (
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-500 font-medium">
                  Você tem R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em pagamentos atrasados. 
                  Entre em contato com a agência para regularizar.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments List */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Mês</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Data de Pagamento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Método</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-zinc-800 hover:bg-zinc-900/50" data-testid={`payment-row-${payment.id}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-zinc-500" />
                            <span className="font-medium">{payment.month}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-white">
                            R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-zinc-400">
                          {payment.payment_date 
                            ? new Date(payment.payment_date).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="py-4 px-4 text-zinc-400">
                          {payment.payment_method || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="mx-auto text-zinc-600 mb-4" size={48} />
                <p className="text-zinc-400">Nenhum pagamento registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PortalPayments;
