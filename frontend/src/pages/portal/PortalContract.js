import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Calendar, Clock, TrendingUp, DollarSign, AlertCircle, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PortalContract = () => {
  const { token } = useClientAuth();
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractInfo();
  }, [token]);

  const fetchContractInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/contract`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContractInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch contract info:', error);
      toast.error('Erro ao carregar informações do contrato');
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

  return (
    <PortalLayout>
      <div className="space-y-8" data-testid="portal-contract-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seu Contrato</h1>
          <p className="text-zinc-400 mt-2">
            Informações e status do seu contrato com a agência.
          </p>
        </div>

        {contractInfo && contractInfo.has_contract ? (
          <>
            {/* Contract Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">Tempo Útil</span>
                    <Calendar className="text-blue-500" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-blue-500">
                    {contractInfo.months_elapsed} {contractInfo.months_elapsed === 1 ? 'mês' : 'meses'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Decorridos desde o início</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">Até Renovação</span>
                    <Clock className="text-orange-500" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-orange-500">
                    {contractInfo.months_remaining} {contractInfo.months_remaining === 1 ? 'mês' : 'meses'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">{contractInfo.days_remaining} dias restantes</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">Duração Total</span>
                    <TrendingUp className="text-emerald-500" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">
                    {contractInfo.duration_months} {contractInfo.duration_months === 1 ? 'mês' : 'meses'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Duração do contrato</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">Valor Mensal</span>
                    <DollarSign className="text-cyan-500" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-cyan-500">
                    R$ {(contractInfo.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Investimento mensal</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Progresso do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo decorrido</span>
                    <span className="text-sm font-semibold text-blue-500">{contractInfo.progress_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={contractInfo.progress_percentage} className="h-4" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500">Data de Início</p>
                      <p className="text-lg font-medium mt-1">{new Date(contractInfo.contract_start).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Data de Término</p>
                      <p className="text-lg font-medium mt-1">{new Date(contractInfo.contract_end).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {contractInfo.is_expired && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-red-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-500">Contrato Expirado</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Seu contrato já expirou. Entre em contato com a agência para renovação e continue aproveitando nossos serviços.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!contractInfo.is_expired && contractInfo.months_remaining <= 2 && (
              <Card className="bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-orange-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-500">Renovação Próxima</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Seu contrato está próximo do vencimento. A agência entrará em contato em breve para discutir a renovação.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!contractInfo.is_expired && contractInfo.months_remaining > 2 && (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="text-emerald-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-500">Contrato Ativo</h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        Seu contrato está ativo e em dia. Continue aproveitando todos os serviços da agência.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto text-zinc-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Nenhum contrato cadastrado</h3>
              <p className="text-zinc-400">
                Entre em contato com a agência para mais informações sobre seu contrato.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalContract;
