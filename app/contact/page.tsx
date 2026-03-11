'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Briefcase } from 'lucide-react';
import { useSiteConfig } from '@/context/SiteConfigContext';

export default function Contact() {
  const [formType, setFormType] = useState<'contact' | 'work'>('contact');
  const { settings } = useSiteConfig();

  const address = settings?.address || 'Av. Brasil, 1234 - Centro, Foz do Iguaçu - PR, 85851-000';
  const phone = settings?.contact_phone || '(45) 3025-0000';
  const whatsapp = settings?.whatsapp_number || '5545984182779';
  const contactEmail = settings?.contact_email || '';

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
         
         <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark-900 mb-4">Estamos aqui para você</h1>
            <p className="text-gray-500">Escolha como podemos ajudar hoje.</p>
            
            <div className="flex justify-center gap-4 mt-8">
               <button 
                  onClick={() => setFormType('contact')}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${formType === 'contact' ? 'bg-brand-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
               >
                  Fale Conosco
               </button>
               <button 
                  onClick={() => setFormType('work')}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${formType === 'work' ? 'bg-brand-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
               >
                  Trabalhe Conosco
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            
            {/* Informações de Contato */}
            <div className="space-y-8">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                     <MapPin className="text-brand-500" /> Onde Estamos
                  </h3>
                  <div className="space-y-4 text-gray-600">
                     <p>
                        <strong>Matriz:</strong><br/>
                        {address}
                     </p>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                     <Phone className="text-brand-500" /> Canais de Atendimento
                  </h3>
                  <div className="space-y-4 text-gray-600">
                     {phone && (
                       <p className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center text-brand-600"><Phone size={16} /></span>
                          {phone}
                       </p>
                     )}
                     {whatsapp && (
                       <p className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-[#25D366]/10 flex items-center justify-center text-[#25D366]"><Phone size={16} /></span>
                          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-brand-600">
                            {whatsapp} (WhatsApp)
                          </a>
                       </p>
                     )}
                     {contactEmail && (
                       <p className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600"><Mail size={16} /></span>
                          <a href={`mailto:${contactEmail}`} className="hover:text-brand-600">{contactEmail}</a>
                       </p>
                     )}
                  </div>
               </div>
            </div>

            {/* Formulários */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
               {formType === 'contact' ? (
                  <form className="space-y-4 animate-fade-in" onSubmit={(e) => e.preventDefault()}>
                     <h3 className="text-xl font-bold text-dark-900 mb-4">Envie uma mensagem</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Nome" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                        <input type="text" placeholder="Sobrenome" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     </div>
                     <input type="email" placeholder="E-mail" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     <input type="tel" placeholder="Telefone/WhatsApp" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     <textarea placeholder="Como podemos ajudar?" rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none"></textarea>
                     <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                        <Send size={18} /> Enviar Mensagem
                     </button>
                  </form>
               ) : (
                  <form className="space-y-4 animate-fade-in" onSubmit={(e) => e.preventDefault()}>
                     <h3 className="text-xl font-bold text-dark-900 mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-brand-500" /> Junte-se ao time
                     </h3>
                     <p className="text-sm text-gray-500 mb-4">Envie seus dados e entraremos em contato quando houver vagas disponíveis.</p>
                     
                     <input type="text" placeholder="Nome Completo" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     <input type="email" placeholder="E-mail" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     <input type="tel" placeholder="Telefone" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Área de Interesse</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none">
                           <option>Motorista (Categoria D/E)</option>
                           <option>Guia de Turismo</option>
                           <option>Atendimento / Vendas</option>
                           <option>Administrativo</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                         <label className="block text-sm font-bold text-gray-700">Link para Currículo (LinkedIn/Drive)</label>
                         <input type="url" placeholder="https://..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none" />
                     </div>

                     <button className="w-full bg-dark-900 hover:bg-dark-800 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                        Enviar Candidatura
                     </button>
                  </form>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}