'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Se já estiver logado, redireciona para admin
  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirecionamento é feito no Context, mas por segurança:
      router.push('/admin');
    } catch (error: any) {
      console.error('Erro de Login:', error);
      // Traduzindo mensagens comuns do Supabase
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Por favor, confirme seu e-mail antes de entrar.');
      } else {
        setErrorMsg('Ocorreu um erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
           <img
             src="/logo.png"
             alt="Foz Turismo SM Logo"
             className="h-12 mx-auto mb-6 object-contain"
             onError={(e) => {
               (e.target as HTMLImageElement).style.display = 'none';
             }}
           />
           <h1 className="text-2xl font-bold text-dark-900">Painel Foz Turismo SM</h1>
           <p className="text-sm text-gray-500 mt-2">Acesso restrito à equipe.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all text-gray-800" 
                placeholder="admin@foztourismosm.com.br" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all text-gray-800" 
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>Entrar <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}