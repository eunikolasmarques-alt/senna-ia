import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointer, Eye, DollarSign } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Media = () => {
  const [googleAdsData, setGoogleAdsData] = useState(null);
  const [metaAdsData, setMetaAdsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaData();
  }, []);

  const fetchMediaData = async () => {
    try {
      const [googleRes, metaRes] = await Promise.all([
        axios.get(`${API_URL}/media/google-ads`),
        axios.get(`${API_URL}/media/meta-ads`),
      ]);
      setGoogleAdsData(googleRes.data);
      setMetaAdsData(metaRes.data);
    } catch (error) {
      console.error('Failed to fetch media data:', error);
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
            {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
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
      <div className="space-y-8" data-testid="media-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Mídia Paga</h1>
          <p className="text-base text-zinc-400">Desempenho das campanhas de anúncios</p>
        </div>

        {/* Google Ads Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Google Ads</h2>
              <p className="text-sm text-zinc-500">Dados consolidados das campanhas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={DollarSign}
              title="Investimento"
              value={`R$ ${googleAdsData?.investment?.toLocaleString('pt-BR')}`}
              subtitle="Total investido"
              color="#10b981"
            />
            <StatCard
              icon={Eye}
              title="Impressões"
              value={googleAdsData?.impressions?.toLocaleString('pt-BR')}
              subtitle={`CTR: ${googleAdsData?.ctr}%`}
              color="#06b6d4"
            />
            <StatCard
              icon={MousePointer}
              title="Cliques"
              value={googleAdsData?.clicks?.toLocaleString('pt-BR')}
              subtitle={`CPC: R$ ${googleAdsData?.cpc}`}
              color="#7c3aed"
            />
            <StatCard
              icon={TrendingUp}
              title="Conversões"
              value={googleAdsData?.conversions}
              subtitle={`ROAS: ${googleAdsData?.roas}x`}
              color="#f97316"
            />
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Investimento e Conversões (Google Ads)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={googleAdsData?.chart_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f4f4f5' }}
                  />
                  <Line type="monotone" dataKey="investment" stroke="#7c3aed" strokeWidth={3} name="Investimento" />
                  <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} name="Conversões" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Meta Ads Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Meta Ads</h2>
              <p className="text-sm text-zinc-500">Facebook e Instagram Ads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Eye}
              title="Alcance"
              value={metaAdsData?.reach?.toLocaleString('pt-BR')}
              subtitle={`Frequência: ${metaAdsData?.frequency}`}
              color="#06b6d4"
            />
            <StatCard
              icon={DollarSign}
              title="CPM"
              value={`R$ ${metaAdsData?.cpm}`}
              subtitle="Custo por mil impressões"
              color="#7c3aed"
            />
            <StatCard
              icon={MousePointer}
              title="CPC"
              value={`R$ ${metaAdsData?.cpc}`}
              subtitle={`CTR: ${metaAdsData?.ctr}%`}
              color="#10b981"
            />
            <StatCard
              icon={TrendingUp}
              title="Resultados"
              value={metaAdsData?.results?.toLocaleString('pt-BR')}
              subtitle={`Invest: R$ ${metaAdsData?.investment?.toLocaleString('pt-BR')}`}
              color="#f97316"
            />
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xl">Desempenho por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Facebook', reach: metaAdsData?.breakdown?.facebook?.reach, ctr: metaAdsData?.breakdown?.facebook?.ctr },
                    { name: 'Instagram', reach: metaAdsData?.breakdown?.instagram?.reach, ctr: metaAdsData?.breakdown?.instagram?.ctr },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f4f4f5' }}
                  />
                  <Bar dataKey="reach" fill="#7c3aed" radius={[8, 8, 0, 0]} name="Alcance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Media;