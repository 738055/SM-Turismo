import Link from 'next/link';
import { Bus, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
          <Bus size={48} />
        </div>
        <h1 className="text-4xl font-bold text-dark-900 mb-2">Ops! 404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
        <p className="text-gray-500 mb-8">
          Parece que a página que você procura pegou a estrada errada ou não existe mais.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg"
        >
          <Home size={20} /> Voltar para o Início
        </Link>
      </div>
    </div>
  );
}