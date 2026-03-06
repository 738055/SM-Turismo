'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';
import { Layers, Trash2, Globe, RefreshCw, Ticket, Bus, Utensils, ShoppingBag, Camera, Hotel, Briefcase, Plane, Star } from 'lucide-react';
import { autoTranslate } from '@/lib/translation';

const ICON_OPTIONS = [
  { name: 'Ticket', component: Ticket }, { name: 'Bus', component: Bus },
  { name: 'Utensils', component: Utensils }, { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Camera', component: Camera }, { name: 'Hotel', component: Hotel },
  { name: 'Briefcase', component: Briefcase }, { name: 'Plane', component: Plane },
  { name: 'Star', component: Star },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Category>>({ name: '', slug: '', active: true, icon: '' });
  const [translating, setTranslating] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return alert("Preencha campos");
    await supabase.from('categories').insert([form]);
    setForm({ name: '', slug: '', active: true, icon: '' });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Excluir?")) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };
  
  const handleTranslate = async () => {
     if(!form.name) return;
     setTranslating(true);
     const tr = await autoTranslate(form, 'category');
     setForm(tr);
     setTranslating(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <h1 className="text-2xl font-bold mb-6">Categorias</h1>
       <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 flex flex-col gap-4">
          <div className="flex gap-4">
             <input className="border p-2 rounded flex-1" placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
             <input className="border p-2 rounded flex-1" placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
             <button onClick={handleTranslate} disabled={translating} className="bg-indigo-50 text-indigo-600 px-3 rounded font-bold">{translating ? '...' : <Globe size={16}/>}</button>
          </div>
          <div className="flex gap-2">
             {ICON_OPTIONS.map(opt => (
                <button key={opt.name} onClick={() => setForm({...form, icon: opt.name})} className={`p-2 border rounded ${form.icon === opt.name ? 'bg-brand-50 border-brand-500 text-brand-600' : ''}`}>
                   <opt.component size={20} />
                </button>
             ))}
          </div>
          <button onClick={handleSave} className="bg-brand-600 text-white p-2 rounded font-bold">Criar</button>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(c => (
             <div key={c.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
                <span className="font-bold">{c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="text-red-500"><Trash2 size={16}/></button>
             </div>
          ))}
       </div>
    </div>
  );
}