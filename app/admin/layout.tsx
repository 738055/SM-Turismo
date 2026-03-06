'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Package, Map, Layers, LayoutTemplate, LogOut,
  LayoutDashboard, Truck, Handshake, Settings
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center text-brand-600 font-bold">Carregando sistema Foz Turismo SM...</div>;

  const menuItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, href: '/admin' },
    { label: 'Produtos', icon: Package, href: '/admin/products' },
    { label: 'Roteiros', icon: Map, href: '/admin/itineraries' },
    { label: 'Frota', icon: Truck, href: '/admin/fleet' }, 
    { label: 'Parceiros', icon: Handshake, href: '/admin/partners' }, 
    { label: 'Categorias', icon: Layers, href: '/admin/categories' },
    { label: 'Banners', icon: LayoutTemplate, href: '/admin/banners' },
    { label: 'Configurações', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-dark-900 text-white flex flex-col fixed h-full z-20 shadow-xl">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
           <img src="/logo.png" alt="Logo" className="h-8 object-contain bg-white rounded p-1" />
           <div>
             <h2 className="font-bold text-sm">Admin Foz Turismo SM</h2>
             <p className="text-[10px] text-gray-400">Gestão de Turismo</p>
           </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
               >
                  <item.icon size={18} /> {item.label}
               </Link>
             );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => signOut()} 
            className="flex items-center gap-2 text-red-400 text-xs font-bold w-full px-2 py-2 hover:bg-red-500/10 rounded transition-colors"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto bg-gray-50 min-h-screen">
         {children}
      </main>
    </div>
  );
}