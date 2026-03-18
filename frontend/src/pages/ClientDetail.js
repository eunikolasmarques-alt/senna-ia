import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, FileText, DollarSign, BarChart, Calendar, Clock, TrendingUp, AlertCircle, Link2, Copy, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contractInfo, setContractInfo] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({});
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const [clientRes, paymentsRes, docsRes] = await Promise.all([
        axios.get(`${API_URL}/clients/${clientId}`),
        axios.get(`${API_URL}/payments?client_id=${clientId}`),
        axios.get(`${API_URL}/documents?client_id=${clientId}`),
      ]);
      setClient(clientRes.data);
      setEditedClient(clientRes.data);
      setPayments(paymentsRes.data);
      setDocuments(docsRes.data);
      
      // Buscar informações do contrato
      try {
        const contractRes = await axios.get(`${API_URL}/clients/${clientId}/contract-info`);
        setContractInfo(contractRes.data);
      } catch (error) {
        console.log('No contract info available');
      }
      
      // Buscar token de acesso do portal
      try {
        const tokenRes = await axios.get(`${API_URL}/clients/${clientId}/access-token`);
        setAccessToken(tokenRes.data);
      } catch (error) {
        console.log('No access token available');
      }
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async () => {
    try {
      await axios.put(`${API_URL}/clients/${clientId}`, editedClient);
      setClient(editedClient);
      setIsEditing(false);
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pago': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Pendente': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Em atraso': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    return colors[status] || colors['Pendente'];
  };

  const generateAccessToken = async () => {
    setGeneratingToken(true);
    try {
      const response = await axios.post(`${API_URL}/clients/${clientId}/generate-access-token`);
      setAccessToken({
        has_token: true,
        token: response.data.token,
        access_url: response.data.access_url,
        client_name: response.data.client_name,
        created_at: response.data.created_at
      });
      toast.success('Link de acesso gerado com sucesso!');
    } catch (error) {
      console.error('Failed to generate access token:', error);
      toast.error('Erro ao gerar link de acesso');
    } finally {
      setGeneratingToken(false);
    }
  };

  const revokeAccessToken = async () => {
    try {
      await axios.delete(`${API_URL}/clients/${clientId}/access-token`);
      setAccessToken({ has_token: false });
      toast.success('Acesso revogado com sucesso!');
    } catch (error) {
      console.error('Failed to revoke access token:', error);
      toast.error('Erro ao revogar acesso');
    }
  };

  const copyAccessLink = () => {
    if (accessToken?.token) {
      const fullUrl = `${window.location.origin}/portal/${accessToken.token}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success('Link copiado para a área de transferência!');
    }
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

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-zinc-500">Cliente não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="client-detail-page">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/clientes')}
            data-testid="back-to-clients-button"
            className="hover:bg-zinc-800"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
              <Building2 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-zinc-400 mt-1">{client.segment || 'Sem segmento definido'}</p>
            </div>
          </div>
          <Button
            onClick={() => isEditing ? handleSaveClient() : setIsEditing(true)}
            data-testid="edit-client-button"
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isEditing ? 'Salvar Alterações' : 'Editar Cliente'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="general" data-testid="tab-general">Informações Gerais</TabsTrigger>
            <TabsTrigger value="contract" data-testid="tab-contract">Contrato</TabsTrigger>
            <TabsTrigger value="portal" data-testid="tab-portal">Portal do Cliente</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">Contratos e Documentos</TabsTrigger>
            <TabsTrigger value="finance" data-testid="tab-finance">Dados Financeiros</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={isEditing ? editedClient.name : client.name}
                      onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>CNPJ</Label>
                    <Input
                      value={isEditing ? editedClient.cnpj || '' : client.cnpj || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, cnpj: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Segmento</Label>
                    <Input
                      value={isEditing ? editedClient.segment || '' : client.segment || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, segment: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={isEditing ? editedClient.website || '' : client.website || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, website: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={isEditing ? editedClient.status : client.status}
                      onChange={(e) => setEditedClient({ ...editedClient, status: e.target.value })}
                      disabled={!isEditing}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option>Ativo</option>
                      <option>Pausado</option>
                      <option>Cancelado</option>
                      <option>Em negociação</option>
                    </select>
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input
                      value={isEditing ? editedClient.address || '' : client.address || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={isEditing ? editedClient.instagram_username || '' : client.instagram_username || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, instagram_username: e.target.value })}
                      disabled={!isEditing}
                      placeholder="@username"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 mt-6">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-4">Informações de Contrato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Data de Início do Contrato</Label>
                      <Input
                        type="date"
                        value={isEditing ? (editedClient.contract_start_date || '').split('T')[0] : (client.contract_start_date || '').split('T')[0]}
                        onChange={(e) => setEditedClient({ ...editedClient, contract_start_date: e.target.value ? `${e.target.value}T00:00:00+00:00` : '' })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Duração do Contrato (meses)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={isEditing ? editedClient.contract_duration_months || 12 : client.contract_duration_months || 12}
                        onChange={(e) => setEditedClient({ ...editedClient, contract_duration_months: parseInt(e.target.value) || 12 })}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contract" className="mt-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                {contractInfo && contractInfo.has_contract ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-zinc-950/50 border-zinc-800">
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

                      <Card className="bg-zinc-950/50 border-zinc-800">
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

                      <Card className="bg-zinc-950/50 border-zinc-800">
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
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-zinc-400 mb-3">Progresso do Contrato</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tempo decorrido</span>
                          <span className="text-sm font-semibold text-blue-500">{contractInfo.progress_percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={contractInfo.progress_percentage} className="h-3" style={{ '--progress-color': '#0066FF' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                      <div>
                        <Label className="text-xs text-zinc-500">Data de Início</Label>
                        <p className="text-sm font-medium mt-1">{new Date(contractInfo.contract_start).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-500">Data de Término</Label>
                        <p className="text-sm font-medium mt-1">{new Date(contractInfo.contract_end).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {contractInfo.is_expired && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle size={20} />
                          <span className="font-semibold">Contrato Expirado</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">Este contrato já expirou. Entre em contato com o cliente para renovação.</p>
                      </div>
                    )}

                    {!contractInfo.is_expired && contractInfo.months_remaining <= 2 && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-500">
                          <AlertCircle size={20} />
                          <span className="font-semibold">Renovação Próxima</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">O contrato está próximo do vencimento. Considere iniciar negociações de renovação.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-zinc-600 mb-4" size={48} />
                    <p className="text-zinc-500 mb-4">Nenhum contrato cadastrado</p>
                    <p className="text-sm text-zinc-600">Adicione as informações de contrato nas Informações Gerais do cliente.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal" className="mt-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="text-blue-500" size={24} />
                  Portal do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-zinc-400">
                    O Portal do Cliente permite que seu cliente acesse uma área exclusiva para visualizar o planejamento de conteúdo, 
                    aprovar peças, acompanhar pagamentos e se comunicar diretamente com a equipe.
                  </p>
                </div>

                {accessToken?.has_token ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                      <Label className="text-xs text-zinc-500">Link de Acesso</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          value={`${window.location.origin}/portal/${accessToken.token}`}
                          readOnly
                          className="flex-1 font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyAccessLink}
                          data-testid="copy-portal-link"
                        >
                          <Copy size={16} className="mr-1" />
                          Copiar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/portal/${accessToken.token}`, '_blank')}
                          data-testid="open-portal-link"
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Abrir
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-zinc-500">Criado em</Label>
                        <p className="text-sm mt-1">
                          {accessToken.created_at 
                            ? new Date(accessToken.created_at).toLocaleDateString('pt-BR', { 
                                day: '2-digit', month: '2-digit', year: 'numeric', 
                                hour: '2-digit', minute: '2-digit' 
                              })
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-zinc-500">Último acesso</Label>
                        <p className="text-sm mt-1">
                          {accessToken.last_used_at 
                            ? new Date(accessToken.last_used_at).toLocaleDateString('pt-BR', { 
                                day: '2-digit', month: '2-digit', year: 'numeric', 
                                hour: '2-digit', minute: '2-digit' 
                              })
                            : 'Nunca acessado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                      <Button 
                        variant="outline"
                        onClick={generateAccessToken}
                        disabled={generatingToken}
                        data-testid="regenerate-token-btn"
                      >
                        <RefreshCw size={16} className={`mr-2 ${generatingToken ? 'animate-spin' : ''}`} />
                        Gerar Novo Link
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                        onClick={revokeAccessToken}
                        data-testid="revoke-token-btn"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Revogar Acesso
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link2 className="mx-auto text-zinc-600 mb-4" size={48} />
                    <p className="text-zinc-400 mb-4">Nenhum link de acesso gerado para este cliente</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={generateAccessToken}
                      disabled={generatingToken}
                      data-testid="generate-token-btn"
                    >
                      {generatingToken ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Link2 size={16} className="mr-2" />
                          Gerar Link de Acesso
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Documentos</span>
                  <Button className="bg-violet-600 hover:bg-violet-700" data-testid="add-document-button">
                    Adicionar Documento
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <FileText className="text-violet-500" size={20} />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-zinc-500">{doc.category}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" data-testid={`view-document-${doc.id}`}>Visualizar</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-8">Nenhum documento cadastrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Valor Mensal</p>
                      <p className="text-2xl font-bold text-emerald-500 mt-1">
                        R$ {client.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign className="text-emerald-500" size={24} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Dia de Vencimento</p>
                      <p className="text-2xl font-bold text-cyan-500 mt-1">Todo dia {client.due_day}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Margem (MF)</p>
                      <p className="text-2xl font-bold text-violet-500 mt-1">{client.margin || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                          <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Data Pag.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                            <td className="py-3 px-4">{payment.month}</td>
                            <td className="py-3 px-4 font-semibold">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-zinc-400">{payment.payment_date || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-8">Nenhum pagamento registrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Integrações de Mídia Paga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <BarChart className="text-cyan-500" size={24} />
                      <div>
                        <p className="font-medium">Google Ads</p>
                        <p className="text-sm text-zinc-500">Conectar conta de anúncios</p>
                      </div>
                    </div>
                    <Button variant="outline" data-testid="connect-google-ads">Conectar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <BarChart className="text-violet-500" size={24} />
                      <div>
                        <p className="font-medium">Meta Ads</p>
                        <p className="text-sm text-zinc-500">Facebook e Instagram Ads</p>
                      </div>
                    </div>
                    <Button variant="outline" data-testid="connect-meta-ads">Conectar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientDetail;