'use client';

import React, { useState, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Product, VehicleConfig, TransferRoute } from '@/lib/types';
import { X, Plus, Plane, ArrowRight, Users, Briefcase, Package } from 'lucide-react';
import { parseCurrencyInput, formatBRL } from '@/lib/utils';

// ============================================================
// Dados estáticos de aeroportos e destinos
// ============================================================

const AIRPORTS = [
  { code: 'IGU', name: 'Foz do Iguaçu — Cataratas Int\'l (IGU)' },
  { code: 'IGR', name: 'Puerto Iguazú — Argentina (IGR)' },
  { code: 'AGT', name: 'Ciudad del Este — Guarani Int\'l (AGT)' },
];

const DESTINATION_ZONES = [
  'Centro de Foz do Iguaçu',
  'Área das Cataratas — FOZ',
  'Área Itaipu — FOZ',
  'JL Hotel — FOZ',
  'Centro Ciudad del Este — PY',
  'Centro Puerto Iguazú — AR',
  'Personalizado',
];

// ============================================================
// Schema Zod
// ============================================================

const vehicleConfigSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Nome do veículo obrigatório'),
  maxPassengers: z.number().min(1, 'Mín. 1 passageiro'),
  maxLargeLuggage: z.number().min(0),
  maxHandLuggage: z.number().min(0),
  requiresFlightNumber: z.boolean(),
  price: z.number().min(0.01, 'Preço obrigatório'),
});

const transferSchema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  category: z.string().min(1, 'Categoria obrigatória'),
  city: z.string().min(1, 'Cidade obrigatória'),
  description: z.string().min(10, 'Descrição mín. 10 caracteres'),
  is_free_cancellation: z.boolean(),
  image_url: z.string().min(1, 'Imagem de capa obrigatória'),
  gallery: z.array(z.string()).optional(),

  // Rota
  originCode: z.string().min(1, 'Aeroporto de origem obrigatório'),
  destinationName: z.string().min(1, 'Destino obrigatório'),
  destinationCustom: z.string().optional(),
  supportsRoundtrip: z.boolean(),
  roundtripMultiplier: z.number().min(1),

  // Veículos
  vehicleConfigs: z.array(vehicleConfigSchema).min(1, 'Adicione ao menos um veículo'),
});

type TransferFormValues = z.infer<typeof transferSchema>;

// Campos por passo para validação seletiva
const STEP_FIELDS: Record<number, (keyof TransferFormValues)[]> = {
  1: ['title', 'category', 'city', 'description'],
  2: ['originCode', 'destinationName'],
  3: ['vehicleConfigs'],
  4: ['image_url'],
};

const CITIES = ['Foz do Iguaçu - BR', 'Ciudad del Este - PY', 'Puerto Iguazu - AR'];

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
  editingProduct?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AirportTransferWizard({ editingProduct, onClose, onSaved }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const existingTransfer = editingProduct?.metadata?.transferDetails;
  const existingRoute = existingTransfer?.routes?.[0];
  const existingVehicles = existingTransfer?.vehicleConfigs ?? [];

  const defaultValues: TransferFormValues = {
    title: editingProduct?.title ?? '',
    category: editingProduct?.category ?? 'transfer',
    city: editingProduct?.city ?? 'Foz do Iguaçu - BR',
    description: editingProduct?.description ?? '',
    is_free_cancellation: editingProduct?.is_free_cancellation ?? false,
    image_url: editingProduct?.image_url ?? '',
    gallery: editingProduct?.gallery ?? [],
    originCode: existingRoute?.origin.code ?? '',
    destinationName: existingRoute?.destination.name ?? '',
    destinationCustom: '',
    supportsRoundtrip: existingTransfer?.supportsRoundtrip ?? true,
    roundtripMultiplier: existingTransfer?.roundtripMultiplier ?? 1.8,
    vehicleConfigs: existingVehicles.length > 0 ? existingVehicles : [],
  };

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, trigger, getValues } = form;

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control, name: 'vehicleConfigs',
  });

  const gallery = watch('gallery') ?? [];
  const imageUrl = watch('image_url');
  const supportsRoundtrip = watch('supportsRoundtrip');
  const destinationName = watch('destinationName');
  const vehicleConfigs = watch('vehicleConfigs');

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setCurrentStep(s => s + 1);
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

  const addVehicle = () => {
    appendVehicle({
      id: crypto.randomUUID(),
      label: '',
      maxPassengers: 4,
      maxLargeLuggage: 2,
      maxHandLuggage: 4,
      requiresFlightNumber: true,
      price: 0,
    });
  };

  const onSubmit = async (values: TransferFormValues) => {
    const destName = values.destinationName === 'Personalizado'
      ? (values.destinationCustom ?? values.destinationName)
      : values.destinationName;

    const originAirport = AIRPORTS.find(a => a.code === values.originCode);

    const route: TransferRoute = {
      id: existingRoute?.id ?? crypto.randomUUID(),
      origin: {
        type: 'airport',
        name: originAirport?.name ?? values.originCode,
        code: values.originCode,
      },
      destination: {
        type: 'city',
        name: destName,
      },
      supportsRoundtrip: values.supportsRoundtrip,
      roundtripMultiplier: values.roundtripMultiplier,
    };

    // Preço base = menor veículo configurado
    const basePrice = Math.min(...values.vehicleConfigs.map(v => v.price));

    const payload: Partial<Product> = {
      product_type: 'transfer',
      title: values.title,
      category: values.category,
      city: values.city,
      description: values.description,
      full_description: values.description,
      location: `${values.originCode} → ${destName}`,
      is_free_cancellation: values.is_free_cancellation,
      price: basePrice,
      pricing_type: 'vehicle',
      image_url: values.image_url,
      gallery: values.gallery ?? [],
      languages: [],
      amenities: [],
      itinerary: [],
      tags: ['transfer', 'aeroporto'],
      metadata: {
        transferDetails: {
          routes: [route],
          vehicleConfigs: values.vehicleConfigs,
          supportsRoundtrip: values.supportsRoundtrip,
          roundtripMultiplier: values.roundtripMultiplier,
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

  const totalSteps = 4;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-dark-900 text-white p-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-brand-400" />
            <h2 className="text-xl font-bold">{editingProduct ? 'Editar' : 'Novo'} Transfer — Passo {currentStep}/{totalSteps}</h2>
          </div>
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
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Dados do Transfer</h3>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título do Serviço</label>
                <input {...register('title')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Transfer Aeroporto IGU — Foz do Iguaçu" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cidade Base</label>
                  <select {...register('city')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <input {...register('category')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="transfer" />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea {...register('description')} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Transfer privativo do aeroporto até seu hotel em Foz do Iguaçu..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input type="checkbox" id="is_free_cancellation" {...register('is_free_cancellation')} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="is_free_cancellation" className="text-sm font-bold text-gray-700">Cancelamento Gratuito</label>
              </div>
            </div>
          )}

          {/* PASSO 2: Configuração do Trecho */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Trecho — Logística de Rota</h3>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Aeroporto de Origem</label>
                  <select {...register('originCode')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                    <option value="">Selecione o aeroporto...</option>
                    {AIRPORTS.map(a => (
                      <option key={a.code} value={a.code}>{a.name}</option>
                    ))}
                  </select>
                  {errors.originCode && <p className="text-red-500 text-xs mt-1">{errors.originCode.message}</p>}
                </div>

                <div className="flex items-center justify-center mt-8">
                  <ArrowRight size={24} className="text-gray-400" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Destino / Zona</label>
                  <select {...register('destinationName')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                    <option value="">Selecione o destino...</option>
                    {DESTINATION_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                  {errors.destinationName && <p className="text-red-500 text-xs mt-1">{errors.destinationName.message}</p>}
                </div>
              </div>

              {destinationName === 'Personalizado' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Destino Personalizado</label>
                  <input {...register('destinationCustom')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Hotel das Cataratas" />
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-800">Suporta Ida e Volta (Roundtrip)?</p>
                    <p className="text-xs text-gray-500 mt-0.5">O cliente poderá comprar transfer de retorno com desconto aplicado automaticamente</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('supportsRoundtrip')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {supportsRoundtrip && (
                  <div className="mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Multiplicador Roundtrip (ex: 1.8 = cobra 80% a mais no total com volta)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="2"
                        {...register('roundtripMultiplier', { valueAsNumber: true })}
                        className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-center font-bold"
                      />
                      <span className="text-sm text-gray-500">
                        → Preço Roundtrip = Preço Ida × {watch('roundtripMultiplier')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASSO 3: Configuração de Veículos */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-gray-800 text-lg">Veículos e Preços</h3>
                <button type="button" onClick={addVehicle}
                  className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded font-bold border border-brand-100 flex items-center gap-1 hover:bg-brand-100">
                  <Plus size={12} /> Adicionar Veículo
                </button>
              </div>

              {errors.vehicleConfigs && typeof errors.vehicleConfigs === 'object' && 'message' in errors.vehicleConfigs && (
                <p className="text-red-500 text-sm">{String(errors.vehicleConfigs.message)}</p>
              )}

              <div className="space-y-4">
                {vehicleFields.map((field, i) => (
                  <div key={field.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 relative">
                    <button type="button" onClick={() => removeVehicle(i)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                      <X size={18} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Veículo</label>
                        <input {...register(`vehicleConfigs.${i}.label`)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Sedan Executivo, Van Luxo" />
                        {errors.vehicleConfigs?.[i]?.label && <p className="text-red-500 text-xs mt-0.5">{errors.vehicleConfigs[i]?.label?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Preço (R$)</label>
                        <input
                          type="text"
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="R$ 0,00"
                          value={vehicleConfigs[i]?.price ? formatBRL(vehicleConfigs[i].price) : ''}
                          onChange={e => {
                            const vc = [...vehicleConfigs];
                            vc[i] = { ...vc[i], price: parseCurrencyInput(e.target.value) };
                            setValue('vehicleConfigs', vc);
                          }}
                        />
                        {errors.vehicleConfigs?.[i]?.price && <p className="text-red-500 text-xs mt-0.5">{errors.vehicleConfigs[i]?.price?.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1"><Users size={12} /> Máx. Passageiros</label>
                        <input type="number" min="1" {...register(`vehicleConfigs.${i}.maxPassengers`, { valueAsNumber: true })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1"><Briefcase size={12} /> Malas Grandes</label>
                        <input type="number" min="0" {...register(`vehicleConfigs.${i}.maxLargeLuggage`, { valueAsNumber: true })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1"><Package size={12} /> Malas de Mão</label>
                        <input type="number" min="0" {...register(`vehicleConfigs.${i}.maxHandLuggage`, { valueAsNumber: true })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 p-2.5 bg-white rounded-lg border">
                      <input type="checkbox" id={`flightNum-${i}`} {...register(`vehicleConfigs.${i}.requiresFlightNumber`)} className="w-4 h-4 accent-brand-600" />
                      <label htmlFor={`flightNum-${i}`} className="text-xs font-bold text-gray-700">Exige número do voo no checkout</label>
                    </div>
                  </div>
                ))}

                {vehicleFields.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 text-sm">Nenhum veículo adicionado.</p>
                    <button type="button" onClick={addVehicle} className="mt-3 text-brand-600 font-bold text-sm hover:underline">
                      + Adicionar primeiro veículo
                    </button>
                  </div>
                )}
              </div>

              {vehicleConfigs.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm">
                  <span className="font-bold text-green-800">Preço "A partir de" no card: </span>
                  <span className="text-green-700">{formatBRL(Math.min(...vehicleConfigs.map(v => v.price || 0)))}</span>
                  <span className="text-green-600 ml-1">(menor veículo configurado)</span>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: Imagens */}
          {currentStep === 4 && (
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
              Salvar Transfer
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
