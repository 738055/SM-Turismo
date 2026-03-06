'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Importante para o Portal
import { Itinerary, CartItem } from '@/lib/types';
import { X, Calendar, ShoppingCart, Check, Sun, Moon, Sunset } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ItineraryModal({ itinerary }: { itinerary: Itinerary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const { addManyToCart } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Garante que o código roda no cliente para acessar document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia o scroll da página de fundo quando o modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Agrupa itens por dia para exibição
  const itemsByDay = itinerary.items?.reduce((acc, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, typeof itinerary.items>);

  const days = Object.keys(itemsByDay || {}).sort((a,b) => Number(a) - Number(b));

  // --- LÓGICA DE CARRINHO ---
  const handleAddToCart = () => {
    if (!startDate) return alert('Por favor, selecione a data de início da viagem.');

    const start = new Date(startDate);
    const cartItemsToAdd: CartItem[] = [];

    // Para cada item do roteiro, cria um CartItem com a data calculada
    itinerary.items?.forEach(item => {
      if (!item.product) return;

      // Calcula data do produto: Data Inicio + (Dia do Roteiro - 1)
      const itemDate = new Date(start);
      // Ajusta timezone offset para evitar erro de dia anterior
      const userTimezoneOffset = itemDate.getTimezoneOffset() * 60000;
      const normalizedDate = new Date(itemDate.getTime() + userTimezoneOffset);
      
      normalizedDate.setDate(normalizedDate.getDate() + (item.day_number - 1));
      const formattedDate = normalizedDate.toISOString().split('T')[0];

      // Prepara seleções (Ex: 2 Adultos)
      const price = item.product.promo_price || item.product.price;
      const selections = [
        { label: 'Adulto (Roteiro)', price: price, quantity: adults },
      ];
      if (children > 0) {
        selections.push({ label: 'Criança (Roteiro)', price: price, quantity: children }); 
      }

      const totalQty = adults + children;
      const totalPrice = price * totalQty;

      cartItemsToAdd.push({
        ...item.product,
        selections,
        totalItemPrice: totalPrice,
        quantity: totalQty,
        selectedDate: formattedDate,
        sourceItinerary: itinerary.title
      });
    });

    addManyToCart(cartItemsToAdd);
    setIsOpen(false);
    router.push('/cart');
  };

  // Conteúdo do Modal isolado para o Portal
  const ModalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
       {/* Backdrop Escuro */}
       <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
       
       {/* Card do Modal */}
       <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row shadow-2xl animate-fade-in scale-100">
          
          {/* Botão de Fechar Flutuante */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 z-50 bg-white p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-500 transition-colors shadow-md border border-gray-100"
            title="Fechar"
          >
             <X size={24} />
          </button>

          {/* Lado Esquerdo: Detalhes do Roteiro */}
          <div className="w-full md:w-2/3 overflow-y-auto p-6 md:p-10 bg-gray-50 custom-scrollbar">
             <h2 className="text-3xl font-extrabold text-dark-900 mb-2 pr-12">{itinerary.title}</h2>
             <p className="text-gray-600 mb-8 leading-relaxed text-lg">{itinerary.description}</p>

             <div className="space-y-8">
                {days.map(day => (
                   <div key={day} className="relative pl-8 border-l-2 border-brand-200">
                      <span className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-brand-500 ring-4 ring-brand-100 flex items-center justify-center text-[10px] text-white font-bold">{day}</span>
                      <h4 className="font-bold text-xl text-dark-900 mb-4">Dia {day}</h4>
                      <div className="grid gap-4">
                         {itemsByDay?.[Number(day)]?.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                               <img src={item.product?.image_url} className="w-20 h-20 rounded-lg object-cover bg-gray-200" alt="" />
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     {item.period === 'Manhã' && <Sun size={14} className="text-orange-400" />}
                                     {item.period === 'Tarde' && <Sunset size={14} className="text-red-400" />}
                                     {item.period === 'Noite' && <Moon size={14} className="text-indigo-400" />}
                                     <span className="text-xs font-bold uppercase text-gray-500">{item.period}</span>
                                  </div>
                                  <h5 className="font-bold text-gray-800 text-lg leading-tight">{item.product?.title}</h5>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.product?.location}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Lado Direito: Checkout Rápido */}
          <div className="w-full md:w-1/3 bg-white p-6 md:p-8 border-l border-gray-100 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-xl">
                <Calendar className="text-brand-500"/> Personalize
             </h3>

             <div className="space-y-6 mb-8 flex-grow overflow-y-auto max-h-[40vh] md:max-h-none custom-scrollbar">
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Data de Início da Viagem</label>
                   <input 
                     type="date" 
                     className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-500 text-gray-800 font-medium"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     min={new Date().toISOString().split('T')[0]}
                   />
                   {startDate && (
                      <div className="bg-green-50 text-green-700 p-3 rounded-lg mt-2 text-sm flex items-start gap-2">
                         <Check size={16} className="mt-0.5 shrink-0"/> 
                         <div>
                            <p className="font-bold">Cronograma:</p>
                            <p>Início: {new Date(startDate).toLocaleDateString('pt-BR')}</p>
                            <p>Fim: {(() => {
                               const d = new Date(startDate);
                               d.setDate(d.getDate() + days.length - 1);
                               return d.toLocaleDateString('pt-BR');
                            })()}</p>
                         </div>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Adultos</label>
                      <input type="number" min="1" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center" value={adults} onChange={e => setAdults(Number(e.target.value))} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Crianças</label>
                      <input type="number" min="0" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-center" value={children} onChange={e => setChildren(Number(e.target.value))} />
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Pacote Completo</p>
                      <p className="text-sm text-gray-500">{itinerary.items?.length} itens inclusos</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-gray-400">Total Estimado</p>
                      <p className="text-xl font-extrabold text-brand-600">
                         R$ {itinerary.items?.reduce((acc, item) => acc + ((item.product?.promo_price || item.product?.price || 0) * (adults + children)), 0).toFixed(2)}
                      </p>
                   </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                   <ShoppingCart size={20} /> Comprar Roteiro
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-3">Checkout seguro via WhatsApp</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <>
      {/* CARD DO ROTEIRO (Visão Geral - Trigger) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
      >
        <div className="relative h-56 overflow-hidden">
           <img src={itinerary.image_url || '/placeholder.jpg'} alt={itinerary.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
              <div>
                 <h3 className="text-white font-bold text-xl drop-shadow-md leading-tight">{itinerary.title}</h3>
                 <p className="text-gray-300 text-xs mt-1">{days.length} Dias • {itinerary.items?.length} Experiências</p>
              </div>
           </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
           <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">{itinerary.description}</p>
           <button className="w-full bg-brand-50 text-brand-700 font-bold py-3 rounded-lg group-hover:bg-brand-500 group-hover:text-white transition-colors">
              Ver Detalhes & Comprar
           </button>
        </div>
      </div>

      {/* MODAL RENDERIZADO VIA PORTAL (NO BODY) */}
      {isOpen && mounted && createPortal(ModalContent, document.body)}
    </>
  );
}