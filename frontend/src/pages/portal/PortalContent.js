import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { 
  FileText, Calendar, Clock, User, CheckCircle, XCircle, 
  Eye, MessageSquare, Image, Film, Layers, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PortalContent = () => {
  const { token } = useClientAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchContent();
  }, [token]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      toast.error('Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedContent || !approvalAction) return;
    
    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/portal/content/${selectedContent.id}/approve`,
        { action: approvalAction, feedback: feedback || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(approvalAction === 'approve' ? 'Conteúdo aprovado!' : 'Conteúdo enviado para revisão');
      setShowApprovalModal(false);
      setShowDetailModal(false);
      setFeedback('');
      fetchContent();
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Erro ao processar aprovação');
    } finally {
      setSubmitting(false);
    }
  };

  const openApprovalModal = (action) => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Aguardando Aprovação': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Aprovado': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Publicado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Agendado': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Revisão': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Briefing': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      'Produção': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    };
    return colors[status] || colors['Briefing'];
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'Reels':
        return <Film size={16} />;
      case 'Stories':
        return <Layers size={16} />;
      case 'Post Feed':
      default:
        return <Image size={16} />;
    }
  };

  const pendingContent = content.filter(c => c.status === 'Aguardando Aprovação');
  const approvedContent = content.filter(c => ['Aprovado', 'Agendado', 'Publicado'].includes(c.status));
  const otherContent = content.filter(c => !['Aguardando Aprovação', 'Aprovado', 'Agendado', 'Publicado'].includes(c.status));

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PortalLayout>
    );
  }

  const ContentCard = ({ item }) => (
    <Card 
      className="bg-zinc-900/50 border-zinc-800 hover:border-blue-600/50 transition-all cursor-pointer"
      onClick={() => { setSelectedContent(item); setShowDetailModal(true); }}
      data-testid={`content-card-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-zinc-400">{getContentTypeIcon(item.content_type)}</span>
              <span className="text-xs text-zinc-500">{item.content_type}</span>
            </div>
            <h3 className="font-semibold text-white mb-2">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              {item.publication_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(item.publication_date).toLocaleDateString('pt-BR')}
                </span>
              )}
              {item.assignee_name && (
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {item.assignee_name}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        </div>
        
        {item.status === 'Aguardando Aprovação' && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={(e) => { e.stopPropagation(); setSelectedContent(item); openApprovalModal('approve'); }}
              data-testid={`approve-btn-${item.id}`}
            >
              <CheckCircle size={14} className="mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); setSelectedContent(item); openApprovalModal('reject'); }}
              data-testid={`reject-btn-${item.id}`}
            >
              <XCircle size={14} className="mr-1" />
              Solicitar Revisão
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PortalLayout>
      <div className="space-y-8" data-testid="portal-content-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seus Conteúdos</h1>
          <p className="text-zinc-400 mt-2">
            Acompanhe e aprove os conteúdos produzidos para você.
          </p>
        </div>

        {pendingContent.length > 0 && (
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-orange-500" size={20} />
                <span className="text-orange-500 font-medium">
                  Você tem {pendingContent.length} conteúdo{pendingContent.length > 1 ? 's' : ''} aguardando sua aprovação
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Aguardando Aprovação ({pendingContent.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Aprovados ({approvedContent.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" data-testid="tab-in-progress">
              Em Produção ({otherContent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingContent.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingContent.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
                  <p className="text-zinc-400">Nenhum conteúdo aguardando aprovação</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedContent.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {approvedContent.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto text-zinc-600 mb-4" size={48} />
                  <p className="text-zinc-400">Nenhum conteúdo aprovado ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="mt-6">
            {otherContent.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {otherContent.map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto text-zinc-600 mb-4" size={48} />
                  <p className="text-zinc-400">Nenhum conteúdo em produção</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
            {selectedContent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getContentTypeIcon(selectedContent.content_type)}
                    {selectedContent.title}
                  </DialogTitle>
                  <DialogDescription>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(selectedContent.status)}`}>
                      {selectedContent.status}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {selectedContent.description && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">Descrição</h4>
                      <p className="text-white">{selectedContent.description}</p>
                    </div>
                  )}
                  
                  {selectedContent.caption && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">Legenda</h4>
                      <p className="text-white whitespace-pre-wrap bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                        {selectedContent.caption}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">Tipo de Conteúdo</h4>
                      <p className="text-white">{selectedContent.content_type}</p>
                    </div>
                    {selectedContent.assignee_name && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">Responsável</h4>
                        <p className="text-white">{selectedContent.assignee_name}</p>
                      </div>
                    )}
                    {selectedContent.publication_date && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">Data de Publicação</h4>
                        <p className="text-white">{new Date(selectedContent.publication_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    {selectedContent.delivery_date && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">Data de Entrega</h4>
                        <p className="text-white">{new Date(selectedContent.delivery_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  {selectedContent.files && selectedContent.files.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Arquivos</h4>
                      <div className="space-y-2">
                        {selectedContent.files.map((file, index) => (
                          <a 
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800 hover:border-blue-600/50 transition-colors"
                          >
                            <FileText size={16} className="text-blue-500" />
                            <span className="text-sm">{file.name || `Arquivo ${index + 1}`}</span>
                            <Eye size={14} className="ml-auto text-zinc-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContent.approval_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">Feedback Anterior</h4>
                      <p className="text-white bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                        {selectedContent.approval_notes}
                      </p>
                    </div>
                  )}
                </div>

                {selectedContent.status === 'Aguardando Aprovação' && (
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                      onClick={() => openApprovalModal('reject')}
                    >
                      <XCircle size={16} className="mr-2" />
                      Solicitar Revisão
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => openApprovalModal('approve')}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Aprovar Conteúdo
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Modal */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? 'Aprovar Conteúdo' : 'Solicitar Revisão'}
              </DialogTitle>
              <DialogDescription>
                {approvalAction === 'approve' 
                  ? 'Confirme a aprovação deste conteúdo. Você pode adicionar um comentário opcional.'
                  : 'Descreva o que precisa ser ajustado neste conteúdo.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Textarea
                placeholder={approvalAction === 'approve' 
                  ? 'Comentário opcional...'
                  : 'Descreva as alterações necessárias...'}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-24"
                data-testid="approval-feedback-input"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleApproval}
                disabled={submitting || (approvalAction === 'reject' && !feedback.trim())}
                className={approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                data-testid="confirm-approval-btn"
              >
                {submitting ? 'Processando...' : (approvalAction === 'approve' ? 'Confirmar Aprovação' : 'Enviar para Revisão')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default PortalContent;
