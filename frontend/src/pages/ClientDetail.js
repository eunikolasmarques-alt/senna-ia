import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, FileText, DollarSign, BarChart } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({});

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
                </div>
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