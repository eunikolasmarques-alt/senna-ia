import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { MessageSquare, Send, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PortalMessages = () => {
  const { token, client } = useClientAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      
      // Mark unread messages as read
      const unreadMessages = response.data.filter(m => m.sender_type === 'agency' && !m.read_at);
      for (const msg of unreadMessages) {
        await axios.post(
          `${API_URL}/portal/messages/${msg.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await axios.post(
        `${API_URL}/portal/messages`,
        { message: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
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
      <div className="space-y-6 h-[calc(100vh-8rem)]" data-testid="portal-messages-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-zinc-400 mt-2">
            Converse diretamente com a equipe da agência.
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col h-[calc(100%-6rem)]">
          <CardHeader className="border-b border-zinc-800 py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare size={20} />
              Chat com a Agência
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                <>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender_type === 'client' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            msg.sender_type === 'client' 
                              ? 'bg-blue-600' 
                              : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                          }`}>
                            {msg.sender_type === 'client' 
                              ? <Building2 size={12} className="text-white" />
                              : <User size={12} className="text-white" />
                            }
                          </div>
                          <span className="text-xs text-zinc-500">
                            {msg.sender_name}
                          </span>
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.sender_type === 'client'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <p className={`text-xs text-zinc-500 mt-1 ${msg.sender_type === 'client' ? 'text-right' : 'text-left'}`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <MessageSquare className="text-zinc-600 mb-4" size={48} />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem ainda</h3>
                  <p className="text-zinc-400 text-sm max-w-md">
                    Envie uma mensagem para iniciar a conversa com a equipe da agência.
                  </p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-12 max-h-32 resize-none"
                  data-testid="message-input"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700 px-4"
                  data-testid="send-message-btn"
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Pressione Enter para enviar ou Shift+Enter para nova linha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default PortalMessages;
