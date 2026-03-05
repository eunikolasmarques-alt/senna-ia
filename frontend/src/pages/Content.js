import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Calendar, User, Tag, Filter } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import ContentCardModal from '../components/ContentCardModal';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLUMNS = [
  { id: 'Briefing', label: 'Briefing', color: '#a1a1aa' },
  { id: 'Em Produção', label: 'Em Produção', color: '#06b6d4' },
  { id: 'Revisão', label: 'Revisão', color: '#f97316' },
  { id: 'Aguardando Aprovação', label: 'Aguardando Aprovação', color: '#eab308' },
  { id: 'Aprovado', label: 'Aprovado', color: '#10b981' },
  { id: 'Agendado', label: 'Agendado', color: '#8b5cf6' },
  { id: 'Publicado', label: 'Publicado', color: '#7c3aed' },
];

const Content = () => {
  const [contentCards, setContentCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtros
  const [filterClient, setFilterClient] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  
  const [newCard, setNewCard] = useState({
    title: '',
    content_type: 'Post Feed',
    client_id: '',
    assignee_id: '',
    publication_date: '',
    publication_time: '',
    delivery_date: '',
    delivery_time: '',
    status: 'Briefing',
    description: '',
    custom_tags: [],
    comments: [],
    activities: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterClient, filterMonth, contentCards]);

  const applyFilters = () => {
    let filtered = [...contentCards];

    if (filterClient !== 'all') {
      filtered = filtered.filter((card) => card.client_id === filterClient);
    }

    if (filterMonth !== 'all') {
      filtered = filtered.filter((card) => {
        if (!card.publication_date) return false;
        const cardMonth = new Date(card.publication_date).getMonth() + 1;
        return cardMonth.toString() === filterMonth;
      });
    }

    setFilteredCards(filtered);
  };

  const fetchData = async () => {
    try {
      const [contentRes, clientsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/content`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/users`),
      ]);
      setContentCards(contentRes.data);
      setFilteredCards(contentRes.data);
      setClients(clientsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/content`, newCard);
      toast.success('Card criado com sucesso!');
      setIsDialogOpen(false);
      fetchData();
      setNewCard({
        title: '',
        content_type: 'Post Feed',
        client_id: '',
        assignee_id: '',
        publication_date: '',
        publication_time: '',
        delivery_date: '',
        delivery_time: '',
        status: 'Briefing',
        description: '',
        custom_tags: [],
        comments: [],
        activities: [],
      });
    } catch (error) {
      console.error('Failed to create card:', error);
      toast.error('Erro ao criar card');
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleUpdateCard = () => {
    fetchData();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    try {
      const card = contentCards.find((c) => c.id === draggableId);
      await axios.put(`${API_URL}/content/${draggableId}`, {
        ...card,
        status: newStatus,
      });

      setContentCards((prev) =>
        prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c))
      );
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Failed to update card:', error);
      toast.error('Erro ao atualizar card');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Não atribuído';
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
      <div className="space-y-8" data-testid="content-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Grade de Conteúdo</h1>
            <p className="text-base text-zinc-400">Gerencie a produção de conteúdo por etapas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 glow-violet" data-testid="add-content-button">
                <Plus className="mr-2" size={20} />
                Novo Conteúdo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Criar Novo Conteúdo</DialogTitle>
                <DialogDescription>Preencha as informações do conteúdo</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Conteúdo</Label>
                  <Input
                    id="title"
                    data-testid="content-title-input"
                    value={newCard.title}
                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                    <select
                      id="content_type"
                      data-testid="content-type-select"
                      value={newCard.content_type}
                      onChange={(e) => setNewCard({ ...newCard, content_type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option>Post Feed</option>
                      <option>Reels</option>
                      <option>Stories</option>
                      <option>Carrossel</option>
                      <option>Blog</option>
                      <option>Email</option>
                      <option>Tráfego Pago</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="client_id">Cliente</Label>
                    <select
                      id="client_id"
                      data-testid="content-client-select"
                      value={newCard.client_id}
                      onChange={(e) => setNewCard({ ...newCard, client_id: e.target.value })}
                      required
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="">Selecione...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignee_id">Responsável</Label>
                    <select
                      id="assignee_id"
                      data-testid="content-assignee-select"
                      value={newCard.assignee_id}
                      onChange={(e) => setNewCard({ ...newCard, assignee_id: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
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
                    <Label htmlFor="publication_date">Data de Publicação</Label>
                    <Input
                      id="publication_date"
                      data-testid="content-date-input"
                      type="date"
                      value={newCard.publication_date}
                      onChange={(e) => setNewCard({ ...newCard, publication_date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button type="submit" data-testid="submit-content-button" className="w-full bg-violet-600 hover:bg-violet-700">
                  Criar Conteúdo
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="text-zinc-500" size={20} />
              <div className="flex gap-4 flex-1">
                <div className="flex-1">
                  <Label className="text-xs text-zinc-500 mb-1">Filtrar por Cliente</Label>
                  <select
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm"
                    data-testid="filter-client"
                  >
                    <option value="all">Todos os clientes</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-zinc-500 mb-1">Filtrar por Mês</Label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm"
                    data-testid="filter-month"
                  >
                    <option value="all">Todos os meses</option>
                    <option value="1">Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterClient('all');
                  setFilterMonth('all');
                }}
                data-testid="clear-filters"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {COLUMNS.map((column) => {
              const cards = filteredCards.filter((card) => card.status === column.id);
              return (
                <div key={column.id} className="min-w-[320px]" data-testid={`column-${column.id}`}>
                  <div
                    className="mb-4 p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${column.color}20`,
                      borderColor: `${column.color}40`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm uppercase tracking-wider" style={{ color: column.color }}>
                        {column.label}
                      </h3>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${column.color}30`, color: column.color }}
                      >
                        {cards.length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-zinc-900/50' : ''
                        }`}
                      >
                        {cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleCardClick(card)}
                                className={`bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer ${
                                  snapshot.isDragging ? 'shadow-xl ring-2 ring-violet-500' : ''
                                }`}
                                data-testid={`content-card-${card.id}`}
                              >
                                <CardContent className="p-4 space-y-3">
                                  <div>
                                    <h4 className="font-semibold text-sm text-white mb-1">{card.title}</h4>
                                    <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                                      {card.content_type}
                                    </span>
                                  </div>

                                  {card.custom_tags && card.custom_tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {card.custom_tags.slice(0, 2).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 rounded-full"
                                          style={{
                                            backgroundColor: `${tag.color}20`,
                                            color: tag.color,
                                            border: `1px solid ${tag.color}40`,
                                          }}
                                        >
                                          {tag.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                      <Tag size={14} />
                                      <span>{getClientName(card.client_id)}</span>
                                    </div>
                                    {card.assignee_id && (
                                      <div className="flex items-center gap-2 text-zinc-500">
                                        <User size={14} />
                                        <span>{getUserName(card.assignee_id)}</span>
                                      </div>
                                    )}
                                    {card.publication_date && (
                                      <div className="flex items-center gap-2 text-zinc-500">
                                        <Calendar size={14} />
                                        <span>{new Date(card.publication_date).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {selectedCard && (
          <ContentCardModal
            card={selectedCard}
            clients={clients}
            users={users}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdate={handleUpdateCard}
          />
        )}
      </div>
    </Layout>
  );
};

export default Content;
