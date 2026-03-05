import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Plus, Paperclip, Calendar, Clock, Tag, User, MessageSquare, Activity, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import FileUploadDialog from './FileUploadDialog';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContentCardModal = ({ card, clients, users, isOpen, onClose, onUpdate }) => {
  const [editedCard, setEditedCard] = useState(card || {});
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Não atribuído';
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/content/${card.id}`, editedCard);
      toast.success('Card atualizado com sucesso!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
      toast.error('Erro ao atualizar card');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API_URL}/content/${card.id}/comment`, {
        text: newComment,
      });
      setNewComment('');
      toast.success('Comentário adicionado!');
      onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleSendApproval = async () => {
    try {
      const response = await axios.post(`${API_URL}/content/${card.id}/send-approval`);
      toast.success(response.data.message);
      onUpdate();
    } catch (error) {
      console.error('Failed to send approval:', error);
      toast.error('Erro ao enviar aprovação');
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f97316', '#ec4899', '#eab308'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setEditedCard({
      ...editedCard,
      custom_tags: [
        ...(editedCard.custom_tags || []),
        { label: newTag, color: randomColor },
      ],
    });
    setNewTag('');
  };

  const handleRemoveTag = (index) => {
    const newTags = [...(editedCard.custom_tags || [])];
    newTags.splice(index, 1);
    setEditedCard({ ...editedCard, custom_tags: newTags });
  };

  const handleFileUpload = (fileData) => {
    const files = editedCard.files || [];
    files.push({
      name: fileData.name,
      url: fileData.url,
      type: fileData.type || 'url',
      size: fileData.size,
    });
    setEditedCard({ ...editedCard, files });
    toast.success('Arquivo adicionado!');
  };

  const handleRemoveFile = (index) => {
    const files = [...(editedCard.files || [])];
    files.splice(index, 1);
    setEditedCard({ ...editedCard, files });
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedCard.title}
                  onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                  className="text-2xl font-bold bg-zinc-950 border-zinc-700"
                  data-testid="edit-card-title"
                />
              ) : (
                <DialogTitle className="text-2xl mb-2">{card.title}</DialogTitle>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="px-2 py-1 bg-zinc-800 rounded">{card.content_type}</span>
                <span>em</span>
                <span className="font-medium text-zinc-300">{getClientName(card.client_id)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="close-modal"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Botões de Ação */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" data-testid="add-member">
                  <User size={16} className="mr-2" />
                  Membros
                </Button>
                <Button variant="outline" size="sm" data-testid="add-attachment" onClick={() => setIsUploadDialogOpen(true)}>
                  <Paperclip size={16} className="mr-2" />
                  Anexo
                </Button>
                <Button variant="outline" size="sm" data-testid="add-tag">
                  <Tag size={16} className="mr-2" />
                  Etiquetas
                </Button>
              </div>

              {/* Etiquetas */}
              {editedCard.custom_tags && editedCard.custom_tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">Etiquetas</h3>
                  <div className="flex gap-2 flex-wrap">
                    {editedCard.custom_tags.map((tag, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: `${tag.color}30`, color: tag.color, border: `1px solid ${tag.color}40` }}
                      >
                        {tag.label}
                        {isEditing && (
                          <button onClick={() => handleRemoveTag(index)} className="hover:opacity-70">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova etiqueta..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="bg-zinc-950 border-zinc-700"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
              )}

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Data de Entrega
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={editedCard.delivery_date || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, delivery_date: e.target.value })}
                      disabled={!isEditing}
                      className="bg-zinc-950 border-zinc-700"
                      data-testid="delivery-date"
                    />
                    <Input
                      type="time"
                      value={editedCard.delivery_time || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, delivery_time: e.target.value })}
                      disabled={!isEditing}
                      className="bg-zinc-950 border-zinc-700 w-32"
                      data-testid="delivery-time"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Data de Postagem
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={editedCard.publication_date || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, publication_date: e.target.value })}
                      disabled={!isEditing}
                      className="bg-zinc-950 border-zinc-700"
                      data-testid="publication-date"
                    />
                    <Input
                      type="time"
                      value={editedCard.publication_time || ''}
                      onChange={(e) => setEditedCard({ ...editedCard, publication_time: e.target.value })}
                      disabled={!isEditing}
                      className="bg-zinc-950 border-zinc-700 w-32"
                      data-testid="publication-time"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-zinc-400">Descrição</h3>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      data-testid="edit-description"
                    >
                      Editar
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedCard.description || ''}
                    onChange={(e) => setEditedCard({ ...editedCard, description: e.target.value })}
                    className="bg-zinc-950 border-zinc-700 min-h-[150px]"
                    placeholder="Adicione uma descrição detalhada..."
                    data-testid="description-textarea"
                  />
                ) : (
                  <div className="text-sm text-zinc-300 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                    {card.description || 'Sem descrição'}
                  </div>
                )}
              </div>

              {/* Anexos */}
              {editedCard.files && editedCard.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">Anexos</h3>
                  <div className="space-y-2">
                    {editedCard.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                        <Paperclip size={16} className="text-blue-500" />
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(file.url, '_blank')}>Abrir</Button>
                          {isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentários */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Comentários e Atividade
                </h3>
                <div className="space-y-3 mb-4">
                  {card.activities && card.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                        {activity.user_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-zinc-400">
                          <span className="font-semibold text-zinc-200">{activity.user_name}</span> {activity.action}
                        </p>
                        <p className="text-xs text-zinc-600">{new Date(activity.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                  {card.comments && card.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                        {comment.user_name.charAt(0)}
                      </div>
                      <div className="flex-1 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{comment.user_name}</span>
                          <span className="text-xs text-zinc-600">{new Date(comment.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-zinc-300">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Escrever um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="bg-zinc-950 border-zinc-700"
                    data-testid="comment-input"
                  />
                  <Button onClick={handleAddComment} size="sm" data-testid="add-comment">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Direita */}
            <div className="space-y-4">
              <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-400">Informações</h3>
                
                <div>
                  <Label className="text-xs text-zinc-500">Responsável</Label>
                  <p className="text-sm mt-1">{getUserName(card.assignee_id)}</p>
                </div>

                <div>
                  <Label className="text-xs text-zinc-500">Status</Label>
                  <select
                    value={editedCard.status}
                    onChange={(e) => setEditedCard({ ...editedCard, status: e.target.value })}
                    disabled={!isEditing}
                    className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:border-violet-500"
                    data-testid="status-select"
                  >
                    <option>Briefing</option>
                    <option>Em Produção</option>
                    <option>Revisão</option>
                    <option>Aguardando Aprovação</option>
                    <option>Aprovado</option>
                    <option>Agendado</option>
                    <option>Publicado</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-zinc-500">Aprovação do Cliente</Label>
                  <div className="mt-1">
                    {card.approval_sent_at ? (
                      <p className="text-sm text-emerald-500">✓ Enviado em {new Date(card.approval_sent_at).toLocaleString('pt-BR')}</p>
                    ) : (
                      <Button
                        onClick={handleSendApproval}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
                        size="sm"
                        data-testid="send-approval"
                      >
                        <Send size={14} className="mr-2" />
                        Enviar para Aprovação
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      data-testid="save-card"
                    >
                      Salvar Alterações
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Editar Card
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleFileUpload}
        title="Adicionar Anexo ao Card"
      />
    </Dialog>
  );
};

export default ContentCardModal;
