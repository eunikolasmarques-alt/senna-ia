import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Search, Building2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    cnpj: '',
    segment: '',
    monthly_value: 0,
    status: 'Ativo',
    due_day: 10,
    contacts: [],
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredClients(
        clients.filter((client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.segment?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clients`, newClient);
      toast.success('Cliente criado com sucesso!');
      setIsDialogOpen(false);
      fetchClients();
      setNewClient({
        name: '',
        cnpj: '',
        segment: '',
        monthly_value: 0,
        status: 'Ativo',
        due_day: 10,
        contacts: [],
      });
    } catch (error) {
      console.error('Failed to create client:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ativo': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Pausado': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Cancelado': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'Em negociação': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return colors[status] || colors['Ativo'];
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
      <div className="space-y-8" data-testid="clients-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Clientes</h1>
            <p className="text-base text-zinc-400">Gerencie seus clientes e relacionamentos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 glow-violet" data-testid="add-client-button">
                <Plus className="mr-2" size={20} />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>Preencha as informações do novo cliente</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    data-testid="client-name-input"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      data-testid="client-cnpj-input"
                      value={newClient.cnpj}
                      onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="segment">Segmento</Label>
                    <Input
                      id="segment"
                      data-testid="client-segment-input"
                      value={newClient.segment}
                      onChange={(e) => setNewClient({ ...newClient, segment: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly_value">Valor Mensal (R$)</Label>
                    <Input
                      id="monthly_value"
                      data-testid="client-value-input"
                      type="number"
                      step="0.01"
                      value={newClient.monthly_value}
                      onChange={(e) => setNewClient({ ...newClient, monthly_value: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_day">Dia de Vencimento</Label>
                    <Input
                      id="due_day"
                      data-testid="client-due-day-input"
                      type="number"
                      min="1"
                      max="31"
                      value={newClient.due_day}
                      onChange={(e) => setNewClient({ ...newClient, due_day: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button type="submit" data-testid="submit-client-button" className="w-full bg-violet-600 hover:bg-violet-700">
                  Criar Cliente
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
          <Input
            placeholder="Buscar clientes..."
            data-testid="search-clients-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900/50 border-zinc-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/clientes/${client.id}`)}
              data-testid={`client-card-${client.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white group-hover:text-violet-400 transition-colors">
                        {client.name}
                      </h3>
                      {client.segment && (
                        <p className="text-sm text-zinc-500">{client.segment}</p>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="text-zinc-600 group-hover:text-violet-400 transition-colors" size={18} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Valor Mensal</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      R$ {client.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Vencimento</span>
                    <span className="text-sm text-zinc-300">Todo dia {client.due_day}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-zinc-700 mb-4" size={64} />
            <p className="text-zinc-500">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;