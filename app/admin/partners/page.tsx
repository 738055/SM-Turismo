'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Partner } from '@/lib/types';
import { Handshake, Trash2, Upload, Save, Plus, X } from 'lucide-react';

async function uploadImage(file: File) {
  const fileName = `partners/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
  await supabase.storage.from('easyvan-media').upload(fileName, file);
  const { data } = supabase.storage.from('easyvan-media').getPublicUrl(fileName);
  return data.publicUrl;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<Partial<Partner>>({ name: '', description: '', active: true, gallery: [] });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (data) setPartners(data);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const url = await uploadImage(e.target.files[0]);
    
    if (isGallery) {
      setForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
    } else {
      setForm(prev => ({ ...prev, vehicle_image_url: url }));
    }
    setUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.vehicle_image_url) return alert("Preencha nome e foto de capa");
    await supabase.from('partners').insert([form]);
    setForm({ name: '', description: '', active: true, gallery: [] });
    fetchPartners();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Excluir?")) return;
    await supabase.from('partners').delete().eq('id', id);
    fetchPartners();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <h1 className="text-2xl font-bold mb-6 text-dark-900 flex items-center gap-2">
         <Handshake className="text-brand-600"/> Gerenciar Parceiros
       </h1>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Nome do Parceiro" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <textarea className="w-full p-2 border rounded h-20" placeholder="Descrição" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Capa */}
             <div>
                <label className="block text-xs font-bold mb-2">Foto Principal (Capa)</label>
                <label className="border p-4 rounded cursor-pointer block text-center hover:bg-gray-50 transition-colors h-32 flex flex-col items-center justify-center">
                   <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, false)} />
                   {form.vehicle_image_url ? <img src={form.vehicle_image_url} className="h-full object-contain rounded"/> : <Upload className="mx-auto text-gray-400"/>}
                </label>
             </div>

             {/* Galeria */}
             <div>
                <label className="block text-xs font-bold mb-2">Galeria Extra</label>
                <div className="flex flex-wrap gap-2">
                   {form.gallery?.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 group">
                         <img src={url} className="w-full h-full object-cover rounded border" />
                         <button onClick={() => removeGalleryImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                      </div>
                   ))}
                   <label className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-brand-500 hover:text-brand-500 text-gray-400 transition-colors">
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                      {uploading ? <span className="text-[8px]">...</span> : <Plus size={20}/>}
                   </label>
                </div>
             </div>
          </div>

          <button onClick={handleSave} disabled={uploading} className="w-full bg-brand-600 text-white py-3 rounded font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
             <Save size={18}/> Salvar
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map(item => (
             <div key={item.id} className="bg-white rounded-xl shadow border overflow-hidden group">
                <div className="h-32 w-full overflow-hidden">
                   <img src={item.vehicle_image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.name} />
                </div>
                <div className="p-4">
                   <div className="flex justify-between items-start">
                      <h4 className="font-bold text-dark-900">{item.name}</h4>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                   </div>
                   <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                   {item.gallery && item.gallery.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Upload size={10}/> +{item.gallery.length} fotos</p>
                   )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}