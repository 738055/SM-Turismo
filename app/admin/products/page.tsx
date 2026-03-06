'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Plus, Trash2, CheckCircle, Upload, X, Calendar, User, Bus, RefreshCw, Globe
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { autoTranslate } from '@/lib/translation';

async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `products/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('easyvan-media').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('easyvan-media').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro upload:', error);
    return null;
  }
}

const CITIES = ['Foz do Iguaçu - BR', 'Ciudad del Este - PY', 'Puerto Iguazu - AR'];

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const initialForm: Partial<Product> = {
    title: '', category: '', description: '', full_description: '',
    location: '', duration: '', capacity: '', languages: [],
    itinerary: [], gallery: [], tags: [], amenities: [], excludes: [],
    price: 0, promo_price: 0, image_url: '', city: 'Foz do Iguaçu - BR',
    pricing_type: 'person', pricing_tiers: [], seasonal_pricing: []
  };
  const [form, setForm] = useState<Partial<Product>>(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);
    if (prodRes.data) setProductsList(prodRes.data);
    if (catRes.data) setCategoriesList(catRes.data);
  };

  const handleEdit = (p: Product) => {
    setForm(p);
    setEditingId(p.id);
    setCurrentStep(1);
    setIsWizardOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const handleTranslate = async () => {
    if (!form.title) return alert("Preencha o título PT");
    setTranslating(true);
    try {
        const translated = await autoTranslate(form, 'product');
        setForm(translated);
    } finally {
        setTranslating(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) {
      if (isGallery) setForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
      else setForm(prev => ({ ...prev, image_url: url }));
    }
    setUploading(false);
  };

  // --- NOVA FUNÇÃO DE MÁSCARA DE MOEDA ---
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não é dígito
    const rawValue = e.target.value.replace(/\D/g, '');
    // Converte para float (centavos)
    const floatValue = Number(rawValue) / 100;
    setForm({ ...form, price: floatValue });
  };

  const saveProduct = async () => {
    if (!form.title || !form.price) return alert("Título e Preço obrigatórios");
    try {
      if (editingId) await supabase.from('products').update(form).eq('id', editingId);
      else await supabase.from('products').insert([form]);
      
      alert("Salvo!");
      setIsWizardOpen(false);
      setEditingId(null);
      setForm(initialForm);
      fetchData();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  if (!isWizardOpen) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-dark-900">Produtos</h1>
            <button onClick={() => { setForm(initialForm); setEditingId(null); setCurrentStep(1); setIsWizardOpen(true); }} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg shadow font-bold flex items-center gap-2">
               <Plus size={18} /> Novo Produto
            </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-gray-900 font-bold border-b">
                  <tr><th className="p-4">Produto</th><th className="p-4">Cidade</th><th className="p-4">Categoria</th><th className="p-4">Preço</th><th className="p-4">Ações</th></tr>
               </thead>
               <tbody>
                  {productsList.map(p => (
                     <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-bold text-dark-900">
                          {p.title}
                          {(p.title_en) && (
                            <span title="Traduzido">
                              <Globe size={12} className="inline ml-2 text-green-500" />
                            </span>
                          )}
                        </td>
                        <td className="p-4"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{p.city}</span></td>
                        <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.category}</span></td>
                        <td className="p-4">R$ {p.price?.toFixed(2)}</td>
                        <td className="p-4 flex gap-2">
                           <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Editar</button>
                           <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
       <div className="bg-dark-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">{editingId ? 'Editar' : 'Novo'} Produto - Passo {currentStep}/5</h2>
          <button onClick={() => setIsWizardOpen(false)}><X size={24}/></button>
       </div>
       <div className="p-8 min-h-[400px]">
          
          {/* --- PASSO 1 ATUALIZADO --- */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
               <div className="flex justify-between items-center border-b pb-2 mb-4">
                 <h3 className="font-bold text-gray-800 text-lg">Dados Principais</h3>
                 <button onClick={handleTranslate} disabled={translating} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                   {translating ? 'Traduzindo...' : '✨ Auto-Traduzir'}
                 </button>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Título do Produto (PT)</label>
                 <input 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                   placeholder="Ex: Passeio nas Cataratas" 
                   value={form.title} 
                   onChange={e => setForm({...form, title: e.target.value})} 
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cidade / Região</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                      value={form.city} 
                      onChange={e => setForm({...form, city: e.target.value})}
                    >
                       {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                       <option value="">Selecione uma categoria...</option>
                       {categoriesList.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preço Base</label>
                  <input 
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg font-bold text-brand-700" 
                    placeholder="R$ 0,00" 
                    value={form.price ? form.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''} 
                    onChange={handlePriceChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">Digite apenas os números (centavos são automáticos).</p>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta (Resumo)</label>
                 <textarea 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none" 
                   placeholder="Breve descrição que aparece no card do produto..." 
                   value={form.description} 
                   onChange={e => setForm({...form, description: e.target.value})} 
                 />
               </div>
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-4">
                <textarea className="w-full p-2 border rounded h-32" placeholder="Descrição Completa" value={form.full_description} onChange={e => setForm({...form, full_description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <input className="p-2 border rounded" placeholder="Localização" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                   <input className="p-2 border rounded" placeholder="Duração" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <textarea className="p-2 border rounded" placeholder="Inclusos (por linha)" value={form.amenities?.join('\n')} onChange={e => setForm({...form, amenities: e.target.value.split('\n')})} />
                   <textarea className="p-2 border rounded" placeholder="Não Inclusos" value={form.excludes?.join('\n')} onChange={e => setForm({...form, excludes: e.target.value.split('\n')})} />
                </div>
             </div>
          )}
          {currentStep === 3 && (
             <div className="space-y-4">
                <h3 className="font-bold">Itinerário Interno (Opcional)</h3>
                <button onClick={() => setForm({...form, itinerary: [...(form.itinerary||[]), {title:'', description:''}]})} className="text-sm text-brand-600 font-bold">+ Item</button>
                {form.itinerary?.map((item, i) => (
                   <div key={i} className="flex gap-2">
                      <input className="border p-1 w-1/3" placeholder="Título" value={item.title} onChange={e => { const nw = [...(form.itinerary||[])]; nw[i].title = e.target.value; setForm({...form, itinerary:nw}) }} />
                      <input className="border p-1 w-2/3" placeholder="Desc" value={item.description} onChange={e => { const nw = [...(form.itinerary||[])]; nw[i].description = e.target.value; setForm({...form, itinerary:nw}) }} />
                      <button onClick={() => setForm({...form, itinerary: form.itinerary?.filter((_, idx) => idx !== i)})} className="text-red-500"><X size={16}/></button>
                   </div>
                ))}
             </div>
          )}
          {currentStep === 4 && (
             <div className="space-y-4">
                <h3 className="font-bold">Preços Avançados</h3>
                <div className="flex gap-4">
                   <label className="flex gap-2"><input type="radio" checked={form.pricing_type === 'person'} onChange={() => setForm({...form, pricing_type: 'person'})} /> Por Pessoa</label>
                   <label className="flex gap-2"><input type="radio" checked={form.pricing_type === 'vehicle'} onChange={() => setForm({...form, pricing_type: 'vehicle'})} /> Por Veículo</label>
                </div>
                {form.pricing_type === 'vehicle' && (
                   <div>
                      <button onClick={() => setForm({...form, pricing_tiers: [...(form.pricing_tiers||[]), {min_pax:1, max_pax:4, price:0}]})} className="text-sm bg-brand-600 text-white px-2 py-1 rounded">Add Faixa</button>
                      {form.pricing_tiers?.map((t, i) => (
                         <div key={i} className="flex gap-2 mt-2 items-center">
                            De <input type="number" className="border w-16" value={t.min_pax} onChange={e => { const nt = [...(form.pricing_tiers||[])]; nt[i].min_pax=Number(e.target.value); setForm({...form, pricing_tiers:nt}) }} />
                            a <input type="number" className="border w-16" value={t.max_pax} onChange={e => { const nt = [...(form.pricing_tiers||[])]; nt[i].max_pax=Number(e.target.value); setForm({...form, pricing_tiers:nt}) }} />
                            R$ <input type="number" className="border w-24" value={t.price} onChange={e => { const nt = [...(form.pricing_tiers||[])]; nt[i].price=Number(e.target.value); setForm({...form, pricing_tiers:nt}) }} />
                            <button onClick={() => setForm({...form, pricing_tiers: form.pricing_tiers?.filter((_, idx) => idx !== i)})} className="text-red-500"><X size={16}/></button>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          )}
          {currentStep === 5 && (
             <div className="space-y-4">
                <label className="block font-bold">Capa</label>
                <input type="file" onChange={e => handleImageUpload(e, false)} />
                {form.image_url && <img src={form.image_url} className="h-32 object-cover rounded" />}
                
                <label className="block font-bold mt-4">Galeria</label>
                <input type="file" onChange={e => handleImageUpload(e, true)} />
                <div className="flex gap-2 mt-2">
                   {form.gallery?.map((url, i) => <img key={i} src={url} className="h-16 w-16 object-cover rounded" />)}
                </div>
             </div>
          )}
       </div>
       <div className="p-6 bg-gray-50 border-t flex justify-between">
          <button disabled={currentStep === 1} onClick={() => setCurrentStep(c => c - 1)} className="px-4 py-2 border rounded disabled:opacity-50">Voltar</button>
          {currentStep < 5 ? <button onClick={() => setCurrentStep(c => c + 1)} className="px-4 py-2 bg-brand-600 text-white rounded">Próximo</button> : <button onClick={saveProduct} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>}
       </div>
    </div>
  );
}