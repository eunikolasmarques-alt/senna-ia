import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { User, Mail, Briefcase, Calendar } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      'Gerente de Contas': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'Social Media': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Designer': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Gestor de Tráfego': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Financeiro': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return colors[role] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
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
      <div className="space-y-8" data-testid="team-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Colaboradores</h1>
          <p className="text-base text-zinc-400">Gerencie a equipe e permissões</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`user-card-${user.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-1">{user.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  {user.department && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Briefcase size={16} />
                      <span>{user.department}</span>
                    </div>
                  )}
                  {user.admission_date && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar size={16} />
                      <span>Desde {new Date(user.admission_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;