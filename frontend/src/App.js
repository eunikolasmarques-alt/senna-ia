import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App min-h-screen bg-zinc-950">
          <Routes>
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
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;