import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { LayoutDashboard, FileText, DollarSign, FileCheck, MessageSquare, LogOut, Building2, FolderOpen } from 'lucide-react';

const PortalLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/portal/dashboard', testId: 'portal-nav-dashboard' },
    { icon: FileText, label: 'Conteúdos', path: '/portal/content', testId: 'portal-nav-content' },
    { icon: FolderOpen, label: 'Meus Arquivos', path: '/portal/files', testId: 'portal-nav-files' },
    { icon: DollarSign, label: 'Pagamentos', path: '/portal/payments', testId: 'portal-nav-payments' },
    { icon: FileCheck, label: 'Contrato', path: '/portal/contract', testId: 'portal-nav-contract' },
    { icon: MessageSquare, label: 'Mensagens', path: '/portal/messages', testId: 'portal-nav-messages' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              senna.ia
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Portal do Cliente</p>
          </div>

          {/* Client Info */}
          {client && (
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{client.segment || 'Cliente'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleLogout}
              data-testid="portal-logout-button"
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default PortalLayout;
