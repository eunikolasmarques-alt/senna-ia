import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Phone, Mail, Building2, DollarSign, User, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Tráfego Pago',
    status: 'Novo',
    interest: '',
    budget: 0,
    notes: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, leads]);

  const fetchData = async () => {
    try {
      const [leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/leads`),
        axios.get(`${API_URL}/users`),
      ]);
      setLeads(leadsRes.data);
      setFilteredLeads(leadsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (searchTerm) {
      filtered = filtered.filter((lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((lead) => lead.status === filterStatus);
    }

    setFilteredLeads(filtered);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leads`, newLead);
      toast.success('Lead criado com sucesso!');
      setIsDialogOpen(false);
      fetchData();
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Tráfego Pago',
        status: 'Novo',
        interest: '',
        budget: 0,
        notes: '',
        assigned_to: '',
      });
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast.error('Erro ao criar lead');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Novo': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Contato Realizado': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Proposta Enviada': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Negociação': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Fechado': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Perdido': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || colors['Novo'];
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Não atribuído';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="leads-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">CRM de Leads</h1>
            <p className="text-base text-zinc-400">Gerencie leads vindos do tráfego pago e outras fontes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-lead-button">
                <Plus className="mr-2" size={20} />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
                <DialogDescription>Preencha as informações do lead</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Origem</Label>
                    <select
                      id="source"
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                    >
                      <option>Tráfego Pago</option>
                      <option>Orgânico</option>
                      <option>Indicação</option>
                      <option>Landing Page</option>
                      <option>Redes Sociais</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                    >
                      <option>Novo</option>
                      <option>Contato Realizado</option>
                      <option>Proposta Enviada</option>
                      <option>Negociação</option>
                      <option>Fechado</option>
                      <option>Perdido</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interest">Interesse</Label>
                    <Input
                      id="interest"
                      value={newLead.interest}
                      onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                      placeholder="Ex: Gestão de Redes Sociais"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Orçamento (R$)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newLead.budget}
                      onChange={(e) => setNewLead({ ...newLead, budget: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="assigned_to">Responsável</Label>
                  <select
                    id="assigned_to"
                    value={newLead.assigned_to}
                    onChange={(e) => setNewLead({ ...newLead, assigned_to: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                  >
                    <option value="">Não atribuído</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Criar Lead
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-md text-zinc-100"
          >
            <option value="all">Todos os status</option>
            <option value="Novo">Novo</option>
            <option value="Contato Realizado">Contato Realizado</option>
            <option value="Proposta Enviada">Proposta Enviada</option>
            <option value="Negociação">Negociação</option>
            <option value="Fechado">Fechado</option>
            <option value="Perdido">Perdido</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`lead-card-${lead.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{lead.name}</CardTitle>
                    {lead.company && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <Building2 size={14} />
                        {lead.company}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Mail size={16} />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Phone size={16} />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.interest && (
                  <div className="text-sm">
                    <span className="text-zinc-500">Interesse:</span>
                    <span className="ml-2 text-zinc-300">{lead.interest}</span>
                  </div>
                )}
                {lead.budget > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">
                      R$ {lead.budget.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
                {lead.assigned_to && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <User size={16} />
                    <span>{getUserName(lead.assigned_to)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="px-2 py-1 bg-zinc-800 rounded">{lead.source}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">Nenhum lead encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Leads;
