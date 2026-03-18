import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const PortalLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken, isAuthenticated, loading: authLoading } = useClientAuth();
  const [status, setStatus] = useState('validating'); // validating, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && !authLoading) {
      validateAndLogin();
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (isAuthenticated && status === 'success') {
      setTimeout(() => {
        navigate('/portal/dashboard');
      }, 1500);
    }
  }, [isAuthenticated, status, navigate]);

  const validateAndLogin = async () => {
    setStatus('validating');
    const result = await loginWithToken(token);
    
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              senna.ia
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Portal do Cliente</p>
          </div>
          <CardTitle className="text-xl">
            {status === 'validating' && 'Validando acesso...'}
            {status === 'success' && 'Acesso autorizado!'}
            {status === 'error' && 'Acesso negado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'validating' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-zinc-400">Verificando seu token de acesso...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-zinc-300 mb-2">Bem-vindo ao Portal do Cliente!</p>
              <p className="text-sm text-zinc-500">Redirecionando para o painel...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-zinc-300 mb-2">{error}</p>
              <p className="text-sm text-zinc-500">
                Entre em contato com a agência para obter um novo link de acesso.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalLogin;
