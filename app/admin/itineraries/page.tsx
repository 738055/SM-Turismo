'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Itinerary, ItineraryItem } from '@/lib/types';
import { 
  Plus, Trash2, Save, ArrowLeft, Calendar, 
  Sun, Moon, Sunset, Upload, Globe, RefreshCw, Edit
} from 'lucide-react';
import { autoTranslate } from '@/lib/translation';

async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `itineraries/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('easyvan-media').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('easyvan-media').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro upload:', error);
    return null;
  }
}

export default function AdminItineraries() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  
  // Listas
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const initialFormState: Partial<Itinerary> = {
    title: '', description: '', image_url: '', active: true, items: []
  };
  const [form, setForm] = useState<Partial<Itinerary>>(initialFormState);
  
  // Controle de Dias do Form
  const [daysCount, setDaysCount] = useState(1);

  useEffect(() => {
    fetchItineraries();
    fetchProducts();
  }, []);

  const fetchItineraries = async () => {
    const { data } = await supabase
      .from('itineraries')
      .select('*, items:itinerary_items(*, product:products(*))')
      .order('created_at', { ascending: false });
    if (data) setItineraries(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, title').order('title');
    if (data) setProducts(data as Product[]);
  };

  const handleCreateNew = () => {
    setForm(initialFormState);
    setDaysCount(1);
    setView('form');
  };

  const handleEdit = (itinerary: Itinerary) => {
    setForm(itinerary);
    // Calcular quantos dias existem baseado nos itens ou default 1
    const maxDay = itinerary.items?.reduce((max, item) => Math.max(max, item.day_number), 0) || 1;
    setDaysCount(maxDay > 0 ? maxDay : 1);
    setView('form');
  };

  const handleTranslate = async () => {
     if (!form.title) return;
     setTranslating(true);
     try {
        const translated = await autoTranslate(form, 'itinerary');
        setForm(translated);
     } finally {
        setTranslating(false);
     }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setLoading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) setForm({ ...form, image_url: url });
    setLoading(false);
  };

  const addItem = (day: number, period: string) => {
    if (!products.length) return alert("Cadastre produtos primeiro!");
    const newItem: ItineraryItem = {
      day_number: day,
      period: period,
      product_id: products[0].id // Default para o primeiro
    };
    setForm(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const updateItemProduct = (index: number, productId: string) => {
    const newItems = [...(form.items || [])];
    newItems[index].product_id = productId;
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) return alert("Título e Imagem são obrigatórios");
    setLoading(true);
    
    try {
      // 1. Salva/Atualiza o Roteiro Pai
      const itineraryData = {
        title: form.title, title_en: form.title_en, title_es: form.title_es,
        description: form.description, description_en: form.description_en, description_es: form.description_es,
        image_url: form.image_url, active: form.active
      };

      let itineraryId = form.id;

      if (itineraryId) {
        await supabase.from('itineraries').update(itineraryData).eq('id', itineraryId);
      } else {
        const { data, error } = await supabase.from('itineraries').insert(itineraryData).select().single();
        if (error) throw error;
        itineraryId = data.id;
      }

      // 2. Atualiza os Itens (Delete All + Insert All para simplificar)
      await supabase.from('itinerary_items').delete().eq('itinerary_id', itineraryId);

      if (form.items && form.items.length > 0) {
         const itemsToInsert = form.items.map(item => ({
            itinerary_id: itineraryId,
            product_id: item.product_id,
            day_number: item.day_number,
            period: item.period
         }));
         const { error: itemsError } = await supabase.from('itinerary_items').insert(itemsToInsert);
         if (itemsError) throw itemsError;
      }

      alert("Roteiro salvo com sucesso!");
      fetchItineraries();
      setView('list');

    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este roteiro?")) return;
    await supabase.from('itineraries').delete().eq('id', id);
    fetchItineraries();
  };

  // --- RENDER ---
  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-dark-900">Meus Roteiros</h1>
            <button onClick={handleCreateNew} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2">
               <Plus size={18} /> Novo Roteiro
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(it => (
               <div key={it.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                  <div className="relative h-48">
                     <img src={it.image_url} className="w-full h-full object-cover" alt={it.title} />
                     <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(it)} className="bg-white p-2 rounded-full text-blue-600 hover:text-blue-800 shadow"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(it.id)} className="bg-white p-2 rounded-full text-red-500 hover:text-red-700 shadow"><Trash2 size={16} /></button>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{it.title}</h3>
                     </div>
                  </div>
                  <div className="p-4">
                     <p className="text-gray-500 text-sm line-clamp-2 mb-4">{it.description}</p>
                     <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <Calendar size={14} /> 
                        {it.items?.reduce((max, i) => Math.max(max, i.day_number), 0)} Dias
                        <span className="mx-1">•</span>
                        {it.items?.length} Atividades
                     </div>
                  </div>
               </div>
            ))}
            {itineraries.length === 0 && <div className="col-span-3 text-center py-10 text-gray-400">Nenhum roteiro cadastrado.</div>}
         </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
       <div className="bg-dark-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={() => setView('list')} className="hover:bg-white/10 p-2 rounded-full"><ArrowLeft size={20} /></button>
             <h2 className="text-xl font-bold">{form.id ? 'Editar Roteiro' : 'Novo Roteiro'}</h2>
          </div>
          <button onClick={handleSave} disabled={loading} className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded font-bold shadow flex items-center gap-2">
             <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Roteiro'}
          </button>
       </div>

       <div className="p-8 space-y-8">
          
          {/* Dados Básicos */}
          <section className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-800">Informações Básicas</h3>
                <button onClick={handleTranslate} disabled={translating} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold flex items-center gap-2 hover:bg-indigo-100">
                   {translating ? <RefreshCw className="animate-spin" size={12}/> : <Globe size={12}/>} Traduzir
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título do Roteiro</label>
                      <input type="text" className="w-full p-2 border rounded focus:border-brand-500 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                      {form.title_en && <div className="text-[10px] text-gray-400 mt-1">EN: {form.title_en} | ES: {form.title_es}</div>}
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descrição</label>
                      <textarea className="w-full p-2 border rounded h-24 focus:border-brand-500 outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                      {form.description_en && <div className="text-[10px] text-gray-400 mt-1">EN: {form.description_en} | ES: {form.description_es}</div>}
                   </div>
                </div>
                
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagem de Capa</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 bg-gray-50 relative group cursor-pointer hover:border-brand-500 transition-colors">
                      {form.image_url ? (
                         <img src={form.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      ) : (
                         <div className="text-center text-gray-400">
                            <Upload size={32} className="mx-auto mb-2" />
                            <span className="text-xs">Clique para enviar</span>
                         </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                   </div>
                </div>
             </div>
          </section>

          {/* Builder de Dias */}
          <section className="space-y-6">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-800">Montar Itinerário</h3>
                <div className="flex gap-2">
                   <button onClick={() => setDaysCount(d => d > 1 ? d - 1 : 1)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">- Dia</button>
                   <span className="px-3 py-1 bg-white border font-bold min-w-[80px] text-center">{daysCount} Dias</span>
                   <button onClick={() => setDaysCount(d => d + 1)} className="px-3 py-1 bg-brand-100 text-brand-700 rounded hover:bg-brand-200">+ Dia</button>
                </div>
             </div>

             <div className="space-y-6">
                {Array.from({ length: daysCount }).map((_, idx) => {
                   const dayNum = idx + 1;
                   const dayItems = form.items?.filter(i => i.day_number === dayNum) || [];

                   return (
                      <div key={dayNum} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <div className="flex items-center gap-2 mb-4">
                            <span className="bg-dark-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{dayNum}</span>
                            <h4 className="font-bold text-gray-700">Dia {dayNum}</h4>
                         </div>

                         <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-4">
                            {dayItems.map((item) => {
                               // Encontrar index real no array principal
                               const realIndex = form.items?.indexOf(item) ?? -1;
                               return (
                                  <div key={realIndex} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm border">
                                     {/* Period Icon */}
                                     <div className="w-8 flex justify-center text-gray-400 shrink-0">
                                        {item.period === 'Manhã' && <Sun size={18} className="text-orange-400" />}
                                        {item.period === 'Tarde' && <Sunset size={18} className="text-red-400" />}
                                        {item.period === 'Noite' && <Moon size={18} className="text-indigo-400" />}
                                     </div>
                                     
                                     {/* Select Product */}
                                     <select 
                                       className="flex-1 p-2 border rounded text-sm bg-gray-50 focus:border-brand-500 outline-none"
                                       value={item.product_id}
                                       onChange={(e) => updateItemProduct(realIndex, e.target.value)}
                                     >
                                        {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                     </select>

                                     {/* Display Period Text */}
                                     <span className="text-xs font-bold text-gray-400 uppercase w-16 text-center">{item.period}</span>

                                     <button onClick={() => removeItem(realIndex)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                  </div>
                               );
                            })}
                            
                            {/* Botoes de Adicionar Slot */}
                            <div className="flex gap-2 mt-2">
                               <button onClick={() => addItem(dayNum, 'Manhã')} className="text-xs flex items-center gap-1 bg-white border px-2 py-1.5 rounded hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-colors shadow-sm"><Sun size={12}/> + Manhã</button>
                               <button onClick={() => addItem(dayNum, 'Tarde')} className="text-xs flex items-center gap-1 bg-white border px-2 py-1.5 rounded hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors shadow-sm"><Sunset size={12}/> + Tarde</button>
                               <button onClick={() => addItem(dayNum, 'Noite')} className="text-xs flex items-center gap-1 bg-white border px-2 py-1.5 rounded hover:bg-indigo-50 text-gray-600 hover:text-indigo-500 transition-colors shadow-sm"><Moon size={12}/> + Noite</button>
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>
          </section>
       </div>
    </div>
  );
}