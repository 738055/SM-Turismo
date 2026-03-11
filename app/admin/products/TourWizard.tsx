'use client';

import React, { useState, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Product, ProductType, Category } from '@/lib/types';
import { X, Plus, Globe, RefreshCw } from 'lucide-react';
import { autoTranslate } from '@/lib/translation';
import { parseCurrencyInput, formatBRL } from '@/lib/utils';

// ============================================================
// Schema Zod — validação por passo
// ============================================================

const tourSchema = z.object({
  title: z.string().min(3, 'Título obrigatório (mín. 3 caracteres)'),
  category: z.string().min(1, 'Selecione uma categoria'),
  city: z.string().min(1, 'Selecione uma cidade'),
  description: z.string().min(10, 'Descrição mínima de 10 caracteres'),
  full_description: z.string().optional(),
  location: z.string().min(2, 'Localização obrigatória'),
  duration: z.string().min(1, 'Duração obrigatória'),
  languages: z.array(z.string()).min(1, 'Informe ao menos um idioma'),
  is_free_cancellation: z.boolean(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  promo_price: z.number().optional(),
  pricing_type: z.enum(['person', 'vehicle']),
  pricing_tiers: z.array(z.object({
    label: z.string().optional(),
    min_pax: z.number(),
    max_pax: z.number(),
    price: z.number(),
  })).optional(),
  amenities: z.array(z.string()),
  excludes: z.array(z.string()).optional(),
  itinerary: z.array(z.object({
    time: z.string().optional(),
    title: z.string().min(1, 'Título do item obrigatório'),
    description: z.string(),
  })).optional(),
  image_url: z.string().min(1, 'Imagem de capa obrigatória'),
  gallery: z.array(z.string()).optional(),
  meetingPoint: z.string().optional(),
  whatToBring: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

// Campos validados por passo (para trigger seletivo)
const STEP_FIELDS: Record<number, (keyof TourFormValues)[]> = {
  1: ['title', 'category', 'city', 'description'],
  2: ['location', 'duration', 'languages'],
  3: [], // itinerary e inclusões são opcionais
  4: ['price'],
  5: ['image_url'],
};

const CITIES = ['Foz do Iguaçu - BR', 'Ciudad del Este - PY', 'Puerto Iguazu - AR'];
const LANGUAGE_OPTIONS = ['Português', 'English', 'Español'];

async function uploadImage(file: File): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('easyvan-media').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('easyvan-media').getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

interface Props {
  productType: ProductType;
  editingProduct?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TourWizard({ productType, editingProduct, onClose, onSaved }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  React.useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const defaultValues: TourFormValues = {
    title: editingProduct?.title ?? '',
    category: editingProduct?.category ?? '',
    city: editingProduct?.city ?? 'Foz do Iguaçu - BR',
    description: editingProduct?.description ?? '',
    full_description: editingProduct?.full_description ?? '',
    location: editingProduct?.location ?? '',
    duration: editingProduct?.duration ?? '',
    languages: editingProduct?.languages ?? [],
    is_free_cancellation: editingProduct?.is_free_cancellation ?? false,
    price: editingProduct?.price ?? 0,
    promo_price: editingProduct?.promo_price,
    pricing_type: editingProduct?.pricing_type ?? 'person',
    pricing_tiers: editingProduct?.pricing_tiers ?? [],
    amenities: editingProduct?.amenities ?? [],
    excludes: editingProduct?.excludes ?? [],
    itinerary: editingProduct?.itinerary ?? [],
    image_url: editingProduct?.image_url ?? '',
    gallery: editingProduct?.gallery ?? [],
    meetingPoint: editingProduct?.metadata?.tourDetails?.meetingPoint ?? '',
    whatToBring: editingProduct?.metadata?.tourDetails?.whatToBring ?? [],
    tags: editingProduct?.tags ?? [],
    is_featured: editingProduct?.is_featured ?? false,
  };

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, trigger, getValues } = form;

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control, name: 'itinerary',
  });

  const { fields: pricingTiersFields, append: appendPricingTier, remove: removePricingTier } = useFieldArray({
    control, name: 'pricing_tiers'
  });

  const gallery = watch('gallery') ?? [];
  const imageUrl = watch('image_url');
  const languages = watch('languages');
  const amenities = watch('amenities');
  const excludes = watch('excludes');
  const pricingType = watch('pricing_type');

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setCurrentStep(s => s + 1);
  };

  const handleTranslate = async () => {
    if (!getValues('title')) { alert('Preencha o título PT primeiro'); return; }
    setTranslating(true);
    try {
      const fakeProduct = { ...getValues() } as any;
      const translated = await autoTranslate(fakeProduct, 'product');
      if (translated.title_en) alert(`Tradução concluída. Os campos EN/ES foram salvos no banco.`);
    } finally {
      setTranslating(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) {
      if (isGallery) setValue('gallery', [...gallery, url]);
      else setValue('image_url', url);
    }
    setUploading(false);
    e.target.value = '';
  };

  const toggleLanguage = (lang: string) => {
    const current = languages ?? [];
    setValue('languages', current.includes(lang) ? current.filter(l => l !== lang) : [...current, lang]);
  };

  const onSubmit = async (values: TourFormValues) => {
    const payload: Partial<Product> = {
      product_type: productType,
      title: values.title,
      category: values.category,
      city: values.city,
      description: values.description,
      full_description: values.full_description ?? '',
      location: values.location,
      duration: values.duration,
      languages: values.languages,
      is_free_cancellation: values.is_free_cancellation,
      price: values.price,
      promo_price: values.promo_price,
      pricing_type: values.pricing_type,
      pricing_tiers: values.pricing_tiers,
      amenities: values.amenities,
      excludes: values.excludes ?? [],
      itinerary: values.itinerary ?? [],
      image_url: values.image_url,
      gallery: values.gallery ?? [],
      tags: values.tags ?? [],
      is_featured: values.is_featured ?? false,
      metadata: {
        tourDetails: {
          meetingPoint: values.meetingPoint,
          whatToBring: values.whatToBring ?? [],
        },
      },
    };

    try {
      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert([payload]);
      }
      onSaved();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    }
  };

  const totalSteps = 5;
  const typeLabel = productType === 'ticket' ? 'Ingresso' : 'Passeio';

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-dark-900 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{editingProduct ? 'Editar' : 'Novo'} {typeLabel} — Passo {currentStep}/{totalSteps}</h2>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-colors ${i < currentStep ? 'bg-brand-500' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
        <button onClick={onClose}><X size={24} /></button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-8 min-h-[420px]">

          {/* PASSO 1: Dados Básicos */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3 mb-2">
                <h3 className="font-bold text-gray-800 text-lg">Dados Principais</h3>
                <button type="button" onClick={handleTranslate} disabled={translating} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded font-bold border border-indigo-100 hover:bg-indigo-100 flex items-center gap-1">
                  <Globe size={12} /> {translating ? 'Traduzindo...' : 'Auto-Traduzir'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título (PT)</label>
                <input {...register('title')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Passeio nas Cataratas do Iguaçu" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cidade</label>
                  <select {...register('city')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select {...register('category')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta (card)</label>
                <textarea {...register('description')} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Breve descrição exibida no card..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Completa</label>
                <textarea {...register('full_description')} rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Descrição detalhada para a página do produto..." />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input type="checkbox" id="is_free_cancellation" {...register('is_free_cancellation')} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="is_free_cancellation" className="text-sm font-bold text-gray-700">Cancelamento Gratuito</label>
              </div>
            </div>
          )}

          {/* PASSO 2: Detalhes do Tour */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Detalhes do {typeLabel}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duração</label>
                  <input {...register('duration')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: 4 horas, Dia inteiro" />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ponto de Encontro</label>
                  <input {...register('meetingPoint')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Recepção do hotel, Parque das Aves" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Localização / Região</label>
                <input {...register('location')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Parque Nacional do Iguaçu" />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Idiomas do Guia</label>
                <div className="flex gap-3 flex-wrap">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-colors ${(languages ?? []).includes(lang) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {lang}
                    </button>
                  ))}
                </div>
                {errors.languages && <p className="text-red-500 text-xs mt-1">{errors.languages.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">O que levar (um item por linha)</label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  placeholder="Protetor solar&#10;Repelente&#10;Roupas leves"
                  value={(watch('whatToBring') ?? []).join('\n')}
                  onChange={e => setValue('whatToBring', e.target.value.split('\n'))}
                />
              </div>
            </div>
          )}

          {/* PASSO 3: Itinerário e Inclusões */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Itinerário e Inclusões</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">O que está incluso (um por linha)</label>
                  <textarea
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    placeholder="Transfer de ida e volta&#10;Guia em PT/EN&#10;Entrada no parque"
                    value={amenities.join('\n')}
                    onChange={e => setValue('amenities', e.target.value.split('\n'))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">O que NÃO está incluso (um por linha)</label>
                  <textarea
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    placeholder="Alimentação&#10;Gorjetas&#10;Compras pessoais"
                    value={(excludes ?? []).join('\n')}
                    onChange={e => setValue('excludes', e.target.value.split('\n'))}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-gray-700">Roteiro Interno (opcional)</label>
                  <button type="button" onClick={() => appendItinerary({ title: '', description: '', time: '' })}
                    className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold border border-brand-100 flex items-center gap-1 hover:bg-brand-100">
                    <Plus size={12} /> Adicionar Item
                  </button>
                </div>
                <div className="space-y-3">
                  {itineraryFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border">
                      <input {...register(`itinerary.${i}.time`)} className="border p-2 rounded w-20 text-sm" placeholder="09:00" />
                      <input {...register(`itinerary.${i}.title`)} className="border p-2 rounded flex-1 text-sm" placeholder="Título da atividade" />
                      <input {...register(`itinerary.${i}.description`)} className="border p-2 rounded flex-[2] text-sm" placeholder="Descrição..." />
                      <button type="button" onClick={() => removeItinerary(i)} className="text-red-500 mt-1"><X size={16} /></button>
                    </div>
                  ))}
                  {itineraryFields.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Nenhum item de roteiro adicionado.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 4: Preços */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Preços</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preço Base (R$)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-lg font-bold text-brand-700"
                    placeholder="R$ 0,00"
                    value={watch('price') ? formatBRL(watch('price')) : ''}
                    onChange={e => setValue('price', parseCurrencyInput(e.target.value))}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preço Promocional (R$)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="R$ 0,00 (opcional)"
                    value={watch('promo_price') ? formatBRL(watch('promo_price') ?? 0) : ''}
                    onChange={e => setValue('promo_price', parseCurrencyInput(e.target.value) || undefined)}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="person" {...register('pricing_type')} className="accent-brand-600" />
                  <span className="font-bold text-sm">Por Pessoa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="vehicle" {...register('pricing_type')} className="accent-brand-600" />
                  <span className="font-bold text-sm">Por Veículo / Faixa</span>
                </label>
              </div>

              {pricingType === 'vehicle' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700">Faixas de Preço</label>
                    <button type="button"
                      onClick={() => appendPricingTier({ label: '', min_pax: 1, max_pax: 4, price: 0 })}
                      className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold border border-brand-100 flex items-center gap-1 hover:bg-brand-100">
                      <Plus size={12} /> Add Faixa
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pricingTiersFields.map((field, i) => (
                      <div key={field.id} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border text-sm">
                        <input {...register(`pricing_tiers.${i}.label`)} className="border p-2 rounded w-28" placeholder="Ex: Sedan" />
                        <span className="text-gray-500">De</span>
                        <input type="number" {...register(`pricing_tiers.${i}.min_pax`, { setValueAs: v => v ? parseInt(v, 10) : 0 })} className="border p-2 rounded w-16" />
                        <span className="text-gray-500">a</span>
                        <input type="number" {...register(`pricing_tiers.${i}.max_pax`, { setValueAs: v => v ? parseInt(v, 10) : 0 })} className="border p-2 rounded w-16" />
                        <span className="text-gray-500">pax — R$</span>
                        <input type="number" {...register(`pricing_tiers.${i}.price`, { setValueAs: v => v ? parseFloat(v) : 0 })} className="border p-2 rounded w-24" />
                        <button type="button" onClick={() => removePricingTier(i)} className="text-red-500"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input type="checkbox" id="is_featured" {...register('is_featured')} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="is_featured" className="text-sm font-bold text-gray-700">Marcar como Destaque na Vitrine</label>
              </div>
            </div>
          )}

          {/* PASSO 5: Imagens */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Imagens</h3>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Imagem de Capa *</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                {uploading && <span className="text-sm text-gray-500 ml-2">Enviando...</span>}
                {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
                {imageUrl && (
                  <div className="relative inline-block mt-4 group">
                    <img src={imageUrl} className="h-40 w-auto object-cover rounded-xl border shadow-sm" alt="Capa" />
                    <button type="button" onClick={() => setValue('image_url', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 z-10">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="block font-bold text-gray-700 mb-2">Galeria de Fotos</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                <div className="flex flex-wrap gap-4 mt-4">
                  {gallery.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} className="h-24 w-24 object-cover rounded-xl border shadow-sm" alt={`Foto ${i + 1}`} />
                      <button type="button" onClick={() => setValue('gallery', gallery.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep(s => s - 1)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-bold text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors">
            Voltar
          </button>
          {currentStep < totalSteps ? (
            <button type="button" onClick={handleNext}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors">
              Próximo
            </button>
          ) : (
            <button type="submit"
              className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors">
              Salvar {typeLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
