import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, FileText, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InternalDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: '',
    doc_type: 'Briefing',
    category: 'Geral',
    description: '',
    file_url: '',
    tags: [],
  });

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    deliverables: [],
    what_includes: [],
    price_range: '',
    duration: '',
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newInclude, setNewInclude] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/internal-documents`),
        axios.get(`${API_URL}/services`),
      ]);
      setDocuments(docsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/internal-documents`, newDoc);
      toast.success('Documento criado com sucesso!');
      setIsDocDialogOpen(false);
      fetchData();
      setNewDoc({
        title: '',
        doc_type: 'Briefing',
        category: 'Geral',
        description: '',
        file_url: '',
        tags: [],
      });
    } catch (error) {
      toast.error('Erro ao criar documento');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/services`, newService);
      toast.success('Serviço criado com sucesso!');
      setIsServiceDialogOpen(false);
      fetchData();
      setNewService({
        name: '',
        description: '',
        deliverables: [],
        what_includes: [],
        price_range: '',
        duration: '',
      });
    } catch (error) {
      toast.error('Erro ao criar serviço');
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setNewService({
        ...newService,
        deliverables: [...newService.deliverables, newDeliverable],
      });
      setNewDeliverable('');
    }
  };

  const addInclude = () => {
    if (newInclude.trim()) {
      setNewService({
        ...newService,
        what_includes: [...newService.what_includes, newInclude],
      });
      setNewInclude('');
    }
  };

  return (
    <Layout>
      <div className="space-y-8" data-testid="internal-docs-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Documentos Internos</h1>
          <p className="text-base text-zinc-400">Mockups, briefings, portfólio e catálogo de serviços</p>
        </div>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="services">Catálogo de Serviços</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <div className="flex justify-end mb-6">
              <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={20} />
                    Novo Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle>Adicionar Documento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDoc} className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={newDoc.title}
                        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <select
                          value={newDoc.doc_type}
                          onChange={(e) => setNewDoc({ ...newDoc, doc_type: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                        >
                          <option>Briefing</option>
                          <option>Mockup</option>
                          <option>Portfólio</option>
                          <option>Apresentação</option>
                          <option>Contrato</option>
                          <option>Outros</option>
                        </select>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <select
                          value={newDoc.category}
                          onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                        >
                          <option>Geral</option>
                          <option>Vendas</option>
                          <option>Marketing</option>
                          <option>Design</option>
                          <option>Desenvolvimento</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>URL do Arquivo</Label>
                      <Input
                        value={newDoc.file_url}
                        onChange={(e) => setNewDoc({ ...newDoc, file_url: e.target.value })}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={newDoc.description}
                        onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Criar Documento
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/10 rounded-lg">
                          <FileText className="text-blue-500" size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <p className="text-sm text-zinc-500">{doc.doc_type}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {doc.description && <p className="text-sm text-zinc-400 mb-3">{doc.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded">{doc.category}</span>
                      <Button variant="ghost" size="sm">Visualizar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="flex justify-end mb-6">
              <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2" size={20} />
                    Novo Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <Label>Nome do Serviço</Label>
                      <Input
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Faixa de Preço</Label>
                        <Input
                          value={newService.price_range}
                          onChange={(e) => setNewService({ ...newService, price_range: e.target.value })}
                          placeholder="R$ 2.000 - 5.000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Duração</Label>
                        <Input
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                          placeholder="Ex: 30 dias"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Entregas</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newDeliverable}
                          onChange={(e) => setNewDeliverable(e.target.value)}
                          placeholder="Adicionar entrega..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                        />
                        <Button type="button" onClick={addDeliverable}>
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {newService.deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-zinc-950 p-2 rounded">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>O que inclui</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newInclude}
                          onChange={(e) => setNewInclude(e.target.value)}
                          placeholder="Adicionar item..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                        />
                        <Button type="button" onClick={addInclude}>
                          <Plus size={16} />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {newService.what_includes.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm bg-zinc-950 p-2 rounded">
                            <CheckCircle size={14} className="text-blue-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Criar Serviço
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && <p className="text-sm text-zinc-400">{service.description}</p>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.price_range && (
                      <div>
                        <span className="text-xs text-zinc-500">Investimento</span>
                        <p className="text-lg font-semibold text-emerald-500">{service.price_range}</p>
                      </div>
                    )}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-400 mb-2">Entregas</h4>
                        <div className="space-y-1">
                          {service.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {service.what_includes && service.what_includes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-400 mb-2">O que inclui</h4>
                        <div className="space-y-1">
                          {service.what_includes.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle size={16} className="text-blue-500 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InternalDocs;
