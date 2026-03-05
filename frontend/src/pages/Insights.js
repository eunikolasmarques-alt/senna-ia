import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Heart, MessageCircle, Bookmark, Share2, Users, Clock, Lightbulb } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Insights = () => {
  const [publishedContent, setPublishedContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [contentRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/insights/published-content`),
        axios.get(`${API_URL}/insights/stats`),
      ]);
      setPublishedContent(contentRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
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

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8" data-testid="insights-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Insights de Conteúdo</h1>
          <p className="text-base text-zinc-400">Performance e análise de conteúdo publicado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Taxa de Engajamento"
            value={`${stats?.engagement_rate}%`}
            color="#10b981"
          />
          <StatCard
            icon={Users}
            title="Crescimento de Seguidores"
            value={`+${stats?.follower_growth}`}
            color="#06b6d4"
          />
          <StatCard
            icon={Clock}
            title="Melhor Horário"
            value={stats?.best_time}
            color="#7c3aed"
          />
          <StatCard
            icon={Heart}
            title="Melhor Formato"
            value={stats?.best_content_type}
            color="#f97316"
          />
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={24} />
              <CardTitle className="text-xl">Sugestões Automáticas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.suggestions?.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                  <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
                  <p className="text-sm text-zinc-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl">Conteúdo Publicado Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedContent.map((post) => (
                <div key={post.id} className="bg-zinc-950/50 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
                  <img src={post.image} alt={post.caption} className="w-full h-48 object-cover" />
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-zinc-400">{new Date(post.date).toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-zinc-300 line-clamp-2">{post.caption}</p>
                    <div className="grid grid-cols-5 gap-2 pt-3 border-t border-zinc-800">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-500">
                          <Heart size={16} />
                          <span className="text-xs font-semibold">{post.likes}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Curtidas</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-500">
                          <MessageCircle size={16} />
                          <span className="text-xs font-semibold">{post.comments}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Coment.</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-500">
                          <Bookmark size={16} />
                          <span className="text-xs font-semibold">{post.saves}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Salvos</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-500">
                          <Share2 size={16} />
                          <span className="text-xs font-semibold">{post.shares}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Compart.</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-cyan-500">
                          <TrendingUp size={16} />
                          <span className="text-xs font-semibold">{post.reach}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Alcance</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Insights;