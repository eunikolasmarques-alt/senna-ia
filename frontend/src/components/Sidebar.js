import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Briefcase, Target, TrendingUp, BarChart3, UserPlus, FolderOpen, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
    { icon: Briefcase, label: 'Clientes', path: '/clientes', testId: 'nav-clients' },
    { icon: FileText, label: 'Conteúdo', path: '/conteudo', testId: 'nav-content' },
    { icon: TrendingUp, label: 'Financeiro', path: '/financeiro', testId: 'nav-financial' },
    { icon: UserPlus, label: 'CRM Leads', path: '/leads', testId: 'nav-leads' },
    { icon: Users, label: 'Colaboradores', path: '/colaboradores', testId: 'nav-team' },
    { icon: Target, label: 'Metas', path: '/metas', testId: 'nav-goals' },
    { icon: BarChart3, label: 'Mídia Paga', path: '/midia-paga', testId: 'nav-media' },
    { icon: BarChart3, label: 'Insights', path: '/insights', testId: 'nav-insights' },
    { icon: FolderOpen, label: 'Docs Internos', path: '/documentos-internos', testId: 'nav-docs' },
  ];

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  senna.ia
                </h1>
                <p className="text-xs text-zinc-500 mt-1">Agência de Marketing</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              data-testid="sidebar-toggle"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>

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
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            {!isCollapsed && user && (
              <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.role}</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              data-testid="logout-button"
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </div>
      <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Content placeholder */}
      </div>
    </>
  );
};

export default Sidebar;