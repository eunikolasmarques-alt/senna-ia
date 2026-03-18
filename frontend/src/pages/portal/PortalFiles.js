import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PortalLayout from '../../components/PortalLayout';
import { Card, CardContent } from '../../components/ui/card';
import { FileText, Link2, Image, Video, Download, FolderOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FILE_ICONS = {
  pdf: FileText,
  image: Image,
  video: Video,
  doc: FileText,
  link: Link2,
};

const FILE_COLORS = {
  pdf: 'text-red-400 bg-red-400/10',
  image: 'text-pink-400 bg-pink-400/10',
  video: 'text-purple-400 bg-purple-400/10',
  doc: 'text-blue-400 bg-blue-400/10',
  link: 'text-cyan-400 bg-cyan-400/10',
};

const CATEGORY_COLORS = {
  'Relatório': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Contrato': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Criativo': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Financeiro': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Apresentação': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Geral': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const PortalFiles = () => {
  const { token } = useClientAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    fetchFiles();
  }, [token]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/portal/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (error) {
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Todos', ...Array.from(new Set(files.map(f => f.category)))];

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Todos' || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Arquivos</h1>
          <p className="text-zinc-400 mt-2">
            Documentos, relatórios e materiais compartilhados pela agência.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar arquivo..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <span>{filtered.length} arquivo(s) encontrado(s)</span>
        </div>

        {/* Files Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <FolderOpen size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum arquivo disponível</p>
            <p className="text-sm mt-1">Aguarde a agência compartilhar documentos com você.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((file) => {
              const IconComp = FILE_ICONS[file.file_type] || Link2;
              const iconStyle = FILE_COLORS[file.file_type] || FILE_COLORS.link;
              const catStyle = CATEGORY_COLORS[file.category] || CATEGORY_COLORS['Geral'];

              return (
                <Card key={file.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
                        <IconComp size={22} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{file.name}</h3>
                        {file.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{file.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catStyle}`}>
                            {file.category}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {formatDate(file.uploaded_at)}
                          </span>
                        </div>
                        {file.uploaded_by_name && (
                          <p className="text-xs text-zinc-600 mt-1">por {file.uploaded_by_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Download/Open button */}
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-medium border border-blue-600/20 hover:border-blue-600/40 transition-all"
                    >
                      <Download size={14} />
                      Abrir / Baixar
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalFiles;
