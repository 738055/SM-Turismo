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

  return (
    <footer className="bg-dark-900 text-gray-300 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Col 1: Logo & Social */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-block">
              <img 
                src="/logo.png" 
                alt="Foz Turismo SM Logo" 
                className="h-14 w-auto object-contain bg-white p-2 rounded-sm"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              Apaixonados por Foz do Iguaçu, oferecemos um serviço de receptivo completo, com vans confortáveis, guias experientes e um atendimento que faz você se sentir em casa.
            </p>
            <div className="flex gap-4">
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-dark-900 transition-all"><Facebook size={20} /></a>
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-dark-900 transition-all"><Instagram size={20} /></a>
              {contactEmail && <a href={`mailto:${contactEmail}`} className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-dark-900 transition-all"><Mail size={20} /></a>}
            </div>
          </div>

          {/* Col 2: Contato */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Contato</h3>
            <ul className="text-sm space-y-4">
              <li className="flex gap-3 items-start"><MapPin size={18} className="text-brand-500 shrink-0 mt-1" /> {address}</li>
              {phone && <li className="flex gap-3 items-center"><Phone size={18} className="text-brand-500 shrink-0" /> {phone}</li>}
              {whatsapp && <li className="flex gap-3 items-center"><MessageCircle size={18} className="text-brand-500 shrink-0" /> {whatsapp}</li>}
              {contactEmail && <li className="flex gap-3 items-center"><Mail size={18} className="text-brand-500 shrink-0" /> {contactEmail}</li>}
            </ul>
          </div>

          {/* Col 3: Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Navegação</h3>
            <ul className="text-sm space-y-4 font-medium">
              <li><Link href="/products" className="hover:text-brand-500 transition-colors">Passeios</Link></li>
              <li><Link href="/about" className="hover:text-brand-500 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/faq" className="hover:text-brand-500 transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link href="/contact" className="hover:text-brand-500 transition-colors">Contato</Link></li>
              <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
          
          {/* Col 4: Newsletter */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Receba Ofertas</h3>
            <p className="text-sm mb-4">Cadastre-se para as melhores promoções de Foz do Iguaçu.</p>
            <form onSubmit={handleSubscribe} className="flex items-center">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-dark-800 border border-gray-700 rounded-none px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow text-white placeholder-gray-400" 
                required 
              />
              <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold rounded-none p-3.5 transition-all">
                <Send size={20} />
              </button>
            </form>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Foz Turismo SM Viagens e Turismo - Todos os direitos reservados.</p>
        </div>
      </div>

      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group" aria-label="Fale conosco no WhatsApp">
        <MessageCircle size={32} fill="white" className="text-white" />
      </a>
    </footer>
  );
};

export default Footer;