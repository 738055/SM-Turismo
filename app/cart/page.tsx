'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Trash2, MessageCircle, ArrowLeft, Bus, User, Hotel, FileText, Calendar, Map } from 'lucide-react';
import Link from 'next/link';

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { settings } = useSiteConfig();
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    hotel: '',
    whatsapp: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = () => {
    if (!formData.name || !formData.whatsapp) {
      alert('Por favor, preencha pelo menos seu Nome e WhatsApp.');
      return;
    }

    const companyPhone = settings?.whatsapp_number || "5545999999999";
    
    let message = `🌟 *NOVA SOLICITAÇÃO DE RESERVA* 🌟%0A%0A`;
    message += `👤 *Titular:* ${formData.name}%0A`;
    message += `🏨 *Hotel:* ${formData.hotel || 'A definir'}%0A`;
    message += `📱 *WhatsApp:* ${formData.whatsapp}%0A`;
    if (formData.notes) message += `📝 *Obs:* ${formData.notes}%0A`;
    
    message += `%0A━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `🛒 *DETALHES DO PEDIDO:*%0A`;
    
    items.forEach((item, index) => {
      message += `%0A*${index + 1}. ${item.title}*`;
      
      // Inclui informações de Roteiro e Data na mensagem
      if (item.sourceItinerary) {
         message += `%0A   🗺 _Roteiro: ${item.sourceItinerary}_`;
      }
      if (item.selectedDate) {
         // Formata a data para PT-BR
         const dateStr = new Date(item.selectedDate).toLocaleDateString('pt-BR');
         message += `%0A   📅 _Data: ${dateStr}_`;
      }

      if (item.selections && Array.isArray(item.selections)) {
        item.selections.forEach(sel => {
          if (sel.quantity > 0) {
            message += `%0A   └ ${sel.quantity}x ${sel.label}`;
          }
        });
      }
      message += `%0A   💰 Subtotal: R$ ${(item.totalItemPrice || 0).toFixed(2)}%0A`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━%0A`;
    message += `%0A💵 *VALOR TOTAL ESTIMADO: R$ ${(total || 0).toFixed(2)}*`;
    message += `%0A%0AAguardo a confirmação de disponibilidade e link de pagamento.`;

    const url = `https://wa.me/${companyPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
           <div className="bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bus size={40} className="text-brand-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
           <p className="text-gray-500 mb-8">Parece que você ainda não escolheu sua próxima aventura.</p>
           <Link href="/products" className="block w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors">
             Explorar Destinos
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
           <Bus className="text-brand-600"/> Finalizar Reserva
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE ITENS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-700">Itens Selecionados ({items.length})</h2>
                  <button onClick={clearCart} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1">
                     <Trash2 size={12} /> Limpar Tudo
                  </button>
               </div>
               <div className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                      <div className="relative w-full sm:w-32 h-32 shrink-0">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover rounded-lg bg-gray-200" />
                        {item.sourceItinerary && (
                           <div className="absolute top-0 left-0 bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-lg shadow-sm z-10">
                              ROTEIRO
                           </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h3>
                           <span className="font-bold text-brand-600 shrink-0 ml-4">R$ {(item.totalItemPrice || 0).toFixed(2)}</span>
                        </div>

                        {/* Badges de Data e Roteiro */}
                        <div className="flex flex-wrap gap-2 mb-3">
                           {item.selectedDate && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                 <Calendar size={12} /> 
                                 {new Date(item.selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', weekday: 'short' })}
                              </span>
                           )}
                           {item.sourceItinerary && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                 <Map size={12} /> {item.sourceItinerary}
                              </span>
                           )}
                        </div>
                        
                        {/* Detalhes Pax */}
                        <div className="text-sm text-gray-600 space-y-1 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                           {item.selections && item.selections.map((sel, sIdx) => (
                              sel.quantity > 0 && (
                                <div key={sIdx} className="flex items-center gap-2">
                                   <span className="bg-white px-1.5 py-0.5 rounded text-xs font-bold text-gray-700 border shadow-sm">{sel.quantity}x</span>
                                   <span>{sel.label}</span>
                                </div>
                              )
                           ))}
                        </div>

                        <button 
                           onClick={() => removeFromCart(item.id, item.selectedDate)} 
                           className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors font-medium"
                        >
                           <Trash2 size={14} /> Remover este item
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <Link href="/products" className="text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-2 font-bold text-sm">
                     <ArrowLeft size={16} /> Adicionar mais passeios
                  </Link>
               </div>
            </div>
          </div>

          {/* CHECKOUT FORM */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <User size={20} className="text-brand-500"/> Seus Dados
                </h3>
                
                <div className="space-y-4 mb-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo *</label>
                      <input 
                        name="name" value={formData.name} onChange={handleInputChange}
                        type="text" placeholder="Ex: Maria Silva" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all" 
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp *</label>
                      <input 
                        name="whatsapp" value={formData.whatsapp} onChange={handleInputChange}
                        type="tel" placeholder="(00) 00000-0000" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all" 
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hotel / Endereço em Foz</label>
                      <div className="relative">
                         <Hotel className="absolute left-3 top-3 text-gray-400" size={18} />
                         <input 
                           name="hotel" value={formData.hotel} onChange={handleInputChange}
                           type="text" placeholder="Onde vamos te buscar?" 
                           className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none transition-all" 
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações</label>
                      <textarea 
                        name="notes" value={formData.notes} onChange={handleInputChange}
                        rows={2} placeholder="Ex: Cadeirinha para bebê, horário preferido..." 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-500 outline-none resize-none transition-all" 
                      />
                   </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-100 pt-4 mb-6">
                   <div className="flex justify-between items-center text-xl font-extrabold text-dark-900">
                      <span>Total Estimado</span>
                      <span>R$ {(total || 0).toFixed(2)}</span>
                   </div>
                   <p className="text-xs text-gray-400 text-right mt-1">Sem taxas ocultas</p>
                </div>

                <button 
                  onClick={handleCheckout} 
                  className="w-full bg-[#25D366] hover:bg-[#1fbd59] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  <MessageCircle size={22} fill="white" /> Enviar Pedido via WhatsApp
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-3 mx-4 leading-tight">
                   Ao clicar, você será redirecionado para o WhatsApp. Nossa equipe confirmará sua reserva em instantes.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}