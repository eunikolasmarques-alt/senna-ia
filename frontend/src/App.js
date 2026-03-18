import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientAuthProvider, useClientAuth } from './contexts/ClientAuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Content from './pages/Content';
import Financial from './pages/Financial';
import Team from './pages/Team';
import Goals from './pages/Goals';
import Media from './pages/Media';
import Insights from './pages/Insights';
import Leads from './pages/Leads';
import InternalDocs from './pages/InternalDocs';
// Portal pages
import PortalLogin from './pages/portal/PortalLogin';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalContent from './pages/portal/PortalContent';
import PortalPayments from './pages/portal/PortalPayments';
import PortalContract from './pages/portal/PortalContract';
import PortalMessages from './pages/portal/PortalMessages';
import PortalFiles from './pages/portal/PortalFiles';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

// Client Portal Route Guard
const PortalRoute = ({ children }) => {
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <BrowserRouter>
          <div className="App min-h-screen bg-zinc-950">
            <Routes>
              {/* Agency Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <PrivateRoute>
                    <Clients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clientes/:clientId"
                element={
                  <PrivateRoute>
                    <ClientDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/conteudo"
                element={
                  <PrivateRoute>
                    <Content />
                  </PrivateRoute>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <PrivateRoute>
                    <Financial />
                  </PrivateRoute>
                }
              />
              <Route
                path="/colaboradores"
                element={
                  <PrivateRoute>
                    <Team />
                  </PrivateRoute>
                }
              />
              <Route
                path="/metas"
                element={
                  <PrivateRoute>
                    <Goals />
                  </PrivateRoute>
                }
              />
              <Route
                path="/midia-paga"
                element={
                  <PrivateRoute>
                    <Media />
                  </PrivateRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <PrivateRoute>
                    <Insights />
                  </PrivateRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <PrivateRoute>
                    <Leads />
                  </PrivateRoute>
                }
              />
              <Route
                path="/documentos-internos"
                element={
                  <PrivateRoute>
                    <InternalDocs />
                  </PrivateRoute>
                }
              />
              
              {/* Client Portal Routes */}
              <Route path="/portal/:token" element={<PortalLogin />} />
              <Route
                path="/portal/dashboard"
                element={
                  <PortalRoute>
                    <PortalDashboard />
                  </PortalRoute>
                }
              />
              <Route
                path="/portal/content"
                element={
                  <PortalRoute>
                    <PortalContent />
                  </PortalRoute>
                }
              />
              <Route
                path="/portal/payments"
                element={
                  <PortalRoute>
                    <PortalPayments />
                  </PortalRoute>
                }
              />
              <Route
                path="/portal/contract"
                element={
                  <PortalRoute>
                    <PortalContract />
                  </PortalRoute>
                }
              />
              <Route
                path="/portal/messages"
                element={
                  <PortalRoute>
                    <PortalMessages />
                  </PortalRoute>
                }
              />
              <Route
                path="/portal/files"
                element={
                  <PortalRoute>
                    <PortalFiles />
                  </PortalRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </ClientAuthProvider>
    </AuthProvider>
  );
};

export default App;