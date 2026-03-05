import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Social Media',
    department: 'Criação',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await register(formData);
      if (result.success) {
        toast.success('Conta criada com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            senna.ia
          </h1>
          <p className="text-zinc-500 text-sm">Agência de Marketing Digital</p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Login' : 'Criar Conta'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Entre com suas credenciais' : 'Cadastre-se para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      data-testid="register-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Cargo</Label>
                    <select
                      id="role"
                      data-testid="register-role-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option>Admin</option>
                      <option>Gerente de Contas</option>
                      <option>Social Media</option>
                      <option>Designer</option>
                      <option>Gestor de Tráfego</option>
                      <option>Financeiro</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                data-testid="login-submit-button"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <button
                onClick={() => setIsLogin(!isLogin)}
                data-testid="toggle-auth-mode"
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;