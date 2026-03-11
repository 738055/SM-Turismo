'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  // Verifica se é a página inicial
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ocultar Navbar em login/admin
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  // Lógica de Estilo:
  // Se rolou a tela OU não está na home, usa fundo branco e texto escuro.
  // Caso contrário (topo da home), usa fundo transparente e texto branco.
  const showSolidNav = scrolled || !isHome;
  
  const navClasses = showSolidNav 
    ? 'bg-white border-b border-gray-200 py-4 shadow-sm' 
    : 'bg-transparent py-5';

  const textClasses = showSolidNav 
    ? 'text-dark-900 hover:text-brand-500' 
    : 'text-white hover:text-gray-200';

  const iconClasses = showSolidNav 
    ? 'text-dark-900 hover:bg-gray-100' 
    : 'text-white hover:bg-white/20';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navClasses}`}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="Foz Turismo SM Logo"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className={`text-sm font-bold uppercase tracking-wider transition-colors ${textClasses}`}>{t('menu_home')}</Link>
            <Link href="/products" className={`text-sm font-bold uppercase tracking-wider transition-colors ${textClasses}`}>{t('menu_destinations')}</Link>
            <Link href="/about" className={`text-sm font-bold uppercase tracking-wider transition-colors ${textClasses}`}>{t('menu_about')}</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
               <button className={`flex items-center gap-1 text-xs font-bold uppercase ${showSolidNav ? 'text-gray-800' : 'text-white'}`}>
                 <Globe size={16} /> {language}
               </button>
               <div className="absolute right-0 top-full mt-2 w-24 bg-white rounded shadow-lg border border-gray-100 hidden group-hover:block overflow-hidden">
                  <button onClick={() => setLanguage('pt')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-800 hover:text-brand-600">Português</button>
                  <button onClick={() => setLanguage('en')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-800 hover:text-brand-600">English</button>
                  <button onClick={() => setLanguage('es')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-800 hover:text-brand-600">Español</button>
               </div>
            </div>

            <Link href="/products" className={`p-2 rounded-full transition-all ${iconClasses}`}>
              <Search size={22} strokeWidth={2} />
            </Link>

            <Link href="/cart" className={`relative p-2 rounded-full transition-all group ${iconClasses}`}>
              <ShoppingCart size={22} strokeWidth={2} className="group-hover:fill-current transition-all" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-600 rounded-full border-2 border-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-md ${showSolidNav ? 'text-gray-900' : 'text-white'}`}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full left-0 top-full shadow-lg animate-fade-in z-50">
          <div className="px-6 py-8 space-y-4 flex flex-col items-center">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-bold text-gray-900 hover:text-brand-600">{t('menu_home')}</Link>
            <Link href="/products" onClick={() => setIsOpen(false)} className="text-xl font-bold text-gray-900 hover:text-brand-600">{t('menu_destinations')}</Link>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="text-xl font-bold text-gray-900 hover:text-brand-600">Carrinho</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-xl font-bold text-gray-900 hover:text-brand-600">{t('menu_about')}</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;