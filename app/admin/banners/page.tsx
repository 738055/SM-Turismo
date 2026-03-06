
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner } from '@/lib/types';
import { LayoutTemplate, Trash2, Upload } from 'lucide-react';

async function uploadImage(file: File) {
  const fileName = `banners/${Date.now()}.${file.name.split('.').pop()}`;
  await supabase.storage.from('easyvan-media').upload(fileName, file);
  const { data } = supabase.storage.from('easyvan-media').getPublicUrl(fileName);
  return data.publicUrl;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<Partial<Banner>>({ title: '', link: '', active: true });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*');
    if (data) setBanners(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const url = await uploadImage(e.target.files[0]);
    setForm(prev => ({ ...prev, [type === 'desktop' ? 'desktop_url' : 'mobile_url']: url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.desktop_url) return alert("Preencha título e imagem desktop");
    await supabase.from('banners').insert([form]);
    setForm({ title: '', link: '', active: true });
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Excluir?")) return;
    await supabase.from('banners').delete().eq('id', id);
    fetchBanners();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <h1 className="text-2xl font-bold mb-6">Banners Home</h1>
       <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
          <div className="flex gap-4">
             <label className="border p-4 rounded cursor-pointer block flex-1 text-center">
                <span className="block text-xs font-bold mb-2">Desktop Image</span>
                <input type="file" className="hidden" onChange={e => handleUpload(e, 'desktop')} />
                {form.desktop_url ? <span className="text-green-600 font-bold">OK</span> : <Upload className="mx-auto text-gray-400"/>}
             </label>
             <label className="border p-4 rounded cursor-pointer block flex-1 text-center">
                <span className="block text-xs font-bold mb-2">Mobile Image</span>
                <input type="file" className="hidden" onChange={e => handleUpload(e, 'mobile')} />
                {form.mobile_url ? <span className="text-green-600 font-bold">OK</span> : <Upload className="mx-auto text-gray-400"/>}
             </label>
          </div>
          <button onClick={handleSave} disabled={uploading} className="w-full bg-brand-600 text-white p-3 rounded font-bold">Salvar Banner</button>
       </div>
       <div className="space-y-4">
          {banners.map(b => (
             <div key={b.id} className="bg-white p-4 rounded shadow border flex gap-4 items-center">
                <img src={b.desktop_url} className="w-24 h-16 object-cover rounded bg-gray-200" />
                <div className="flex-1"><h4 className="font-bold">{b.title}</h4></div>
                <button onClick={() => handleDelete(b.id)} className="text-red-500"><Trash2/></button>
             </div>
          ))}
       </div>
    </div>
  );
}