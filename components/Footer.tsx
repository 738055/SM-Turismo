'use client';

import React, { useState } from 'react';
import { Facebook, Instagram, Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteConfig } from '@/context/SiteConfigContext';

const Footer: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { settings } = useSiteConfig();
  const [email, setEmail] = useState('');

  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  const whatsapp = settings?.whatsapp_number || '5545999999999';
  const address = settings?.address || 'Av. Brasil, 1234 - Centro, Foz do Iguaçu - PR';
  const phone = settings?.contact_phone || '(45) 3025-0000';
  const contactEmail = settings?.contact_email || '';
  const instagramUrl = settings?.instagram_url || '#';
  const facebookUrl = settings?.facebook_url || '#';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Bem-vindo à família Foz Turismo SM! O email ${email} foi cadastrado.`);
    setEmail('');
  };

  const quickLinks = [
    { label: 'Quem Somos', href: '/about' },
    { label: 'Trabalhe Conosco', href: '/contact' },
    { label: 'Galeria', href: '/products' },
    { label: 'Blog', href: '/contact' },
    { label: 'Ajuda', href: '/faq' },
  ];

  return (
    <footer className="bg-white text-gray-700 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <svg className="absolute bottom-0 left-0 w-[120%] md:w-[60%] h-auto text-brand-100 opacity-60" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path d="M0,400 L0,0 C150,200 400,350 1000,400 Z" fill="currentColor" />
         </svg>
         <svg className="absolute top-0 right-0 w-[40%] h-auto text-brand-50 opacity-80" viewBox="0 0 400 400" fill="none">
            <circle cx="350" cy="50" r="300" fill="currentColor" />
         </svg>
      </div>

      <div className="relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-12 text-center">
          <div className="flex justify-center mb-4">
            <Mail size={48} className="text-brand-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-dark-900 mb-8">Entre para o clube Foz Turismo SM e receba ofertas!</h2>
          <form onSubmit={handleSubscribe} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Seu Nome" className="w-full bg-gray-100 border border-gray-200 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" />
            <input type="email" placeholder="Seu E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 border border-gray-200 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" required />
            <input type="tel" placeholder="Seu WhatsApp" className="w-full bg-gray-100 border border-gray-200 rounded px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" />
            <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded px-4 py-3 transition-all uppercase tracking-wide shadow-lg hover:shadow-brand-500/40">Entrar</button>
          </form>
          <p className="text-xs text-gray-500">
            Enviaremos apenas as melhores promoções da Foz Turismo SM. Consulte nossas <Link href="/terms" className="text-brand-600 hover:underline">políticas</Link>.
          </p>
        </div>

        <div className="py-8">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap justify-center gap-4">
              {quickLinks.map((link, idx) => (
                <Link key={idx} href={link.href} className="bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-bold py-3 px-6 rounded-lg transition-all text-sm uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  {link.label}
                </Link>
              ))}
          </div>
        </div>

        <div className="border-t-4 border-brand-500 pt-12 pb-8 bg-white/60 backdrop-blur-[2px]">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="flex flex-col items-start">
                <img 
                  src="/logo.png" 
                  alt="Foz Turismo SM Logo" 
                  className="h-14 w-auto mb-6 object-contain" 
                />
              </div>
              <div>
                <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand-500" /> Escritório</h3>
                <ul className="text-sm space-y-3 text-gray-600">
                  <li className="leading-relaxed">{address}</li>
                  {phone && <li className="flex gap-2 items-center"><Phone size={16} className="text-brand-500 shrink-0" /> {phone}</li>}
                  {contactEmail && <li className="flex gap-2 items-center"><Mail size={16} className="text-brand-500 shrink-0" /> {contactEmail}</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2"><Send size={18} className="text-brand-500" /> Plantão 24h</h3>
                <ul className="text-sm space-y-3 text-gray-600">
                  <li className="leading-relaxed">Atendimento emergencial para<br/> clientes em viagem.</li>
                  {whatsapp && <li className="flex gap-2 items-center"><Phone size={16} className="text-brand-500 shrink-0" /> {whatsapp}</li>}
                  {contactEmail && <li className="flex gap-2 items-center"><Mail size={16} className="text-brand-500 shrink-0" /> {contactEmail}</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-dark-900 mb-4">Top Destinos</h3>
                <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600 font-medium">
                  <li><Link href="/product/1" className="hover:text-brand-600 hover:translate-x-1 transition-transform inline-block">Cataratas do Iguaçu</Link></li>
                  <li><Link href="/product/2" className="hover:text-brand-600 hover:translate-x-1 transition-transform inline-block">Compras Paraguai</Link></li>
                  <li><Link href="/products" className="hover:text-brand-600 hover:translate-x-1 transition-transform inline-block">City Tour Foz</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-gray-200/60 text-center relative">
              <h4 className="font-bold text-gray-800 mb-4">Siga a Foz Turismo SM</h4>
              <div className="flex justify-center gap-6 mb-8">
                  <a href={facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-dark-900 hover:bg-brand-500 hover:text-white transition-all hover:-translate-y-1"><Facebook size={20} /></a>
                  <a href={instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-dark-900 hover:bg-brand-500 hover:text-white transition-all hover:-translate-y-1"><Instagram size={20} /></a>
                  {contactEmail && <a href={`mailto:${contactEmail}`} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-dark-900 hover:bg-brand-500 hover:text-white transition-all hover:-translate-y-1"><Mail size={20} /></a>}
              </div>
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} Foz Turismo SM Viagens e Turismo - Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group" aria-label="Fale conosco no WhatsApp">
        <MessageCircle size={32} fill="white" className="text-white" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">!</span>
      </a>
    </footer>
  );
};

export default Footer;