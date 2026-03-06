'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/lib/types';
import { useSiteConfig } from '@/context/SiteConfigContext';
import {
  Save, Loader2, CheckCircle2, AlertCircle,
  Building2, Phone, Share2, Search, Cpu
} from 'lucide-react';

type Tab = 'geral' | 'redes' | 'seo' | 'integracoes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'geral',       label: 'Geral / Contato',  icon: <Building2 size={16} /> },
  { id: 'redes',       label: 'Redes Sociais',    icon: <Share2 size={16} /> },
  { id: 'seo',         label: 'SEO',              icon: <Search size={16} /> },
  { id: 'integracoes', label: 'Integrações',      icon: <Cpu size={16} /> },
];

type FormState = Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_FORM: FormState = {
  company_name: '',
  cnpj: '',
  address: '',
  whatsapp_number: '',
  contact_email: '',
  contact_phone: '',
  instagram_url: '',
  facebook_url: '',
  seo_default_title: '',
  seo_default_description: '',
  seo_keywords: '',
  google_pixel_id: '',
};

export default function SettingsPage() {
  const { settings, settingsLoading, refetchSettings } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Preenche o formulário quando os dados chegam do contexto
  useEffect(() => {
    if (settings) {
      setSettingsId(settings.id);
      setForm({
        company_name:            settings.company_name        ?? '',
        cnpj:                    settings.cnpj                ?? '',
        address:                 settings.address             ?? '',
        whatsapp_number:         settings.whatsapp_number     ?? '',
        contact_email:           settings.contact_email       ?? '',
        contact_phone:           settings.contact_phone       ?? '',
        instagram_url:           settings.instagram_url       ?? '',
        facebook_url:            settings.facebook_url        ?? '',
        seo_default_title:       settings.seo_default_title   ?? '',
        seo_default_description: settings.seo_default_description ?? '',
        seo_keywords:            settings.seo_keywords        ?? '',
        google_pixel_id:         settings.google_pixel_id     ?? '',
      });
    }
  }, [settings]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    setStatus('idle');

    const { error } = await supabase
      .from('site_settings')
      .update(form)
      .eq('id', settingsId);

    if (error) {
      console.error('[Settings] Erro ao salvar:', error);
      setStatus('error');
    } else {
      setStatus('success');
      await refetchSettings();
    }
    setSaving(false);
  };

  const field = (
    label: string,
    key: keyof FormState,
    opts?: { placeholder?: string; hint?: string; textarea?: boolean }
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {opts?.textarea ? (
        <textarea
          rows={3}
          value={form[key] ?? ''}
          onChange={e => handleChange(key, e.target.value)}
          placeholder={opts?.placeholder}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition bg-white resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key] ?? ''}
          onChange={e => handleChange(key, e.target.value)}
          placeholder={opts?.placeholder}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition bg-white"
        />
      )}
      {opts?.hint && <p className="text-xs text-gray-400">{opts.hint}</p>}
    </div>
  );

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span>Carregando configurações...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-red-500">
        <AlertCircle size={24} />
        <span>Tabela <code>site_settings</code> não encontrada. Execute a migration no Supabase.</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">Configurações do Site</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie os dados da empresa, contato, SEO e integrações.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        {activeTab === 'geral' && (
          <>
            <h2 className="text-base font-bold text-dark-900 flex items-center gap-2">
              <Building2 size={18} className="text-brand-500" /> Dados da Empresa
            </h2>
            {field('Nome da Empresa', 'company_name', { placeholder: 'Foz Turismo SM' })}
            {field('CNPJ', 'cnpj', { placeholder: '00.000.000/0001-00' })}
            {field('Endereço', 'address', { placeholder: 'Av. Brasil, 1234 - Centro, Foz do Iguaçu - PR' })}

            <hr className="border-gray-100" />

            <h2 className="text-base font-bold text-dark-900 flex items-center gap-2">
              <Phone size={18} className="text-brand-500" /> Contato
            </h2>
            {field('WhatsApp', 'whatsapp_number', {
              placeholder: '5545999999999',
              hint: 'Formato internacional sem espaços ou símbolos. Ex: 5545999999999'
            })}
            {field('Telefone Fixo', 'contact_phone', { placeholder: '(45) 3025-0000' })}
            {field('E-mail de Contato', 'contact_email', { placeholder: 'contato@foztourismosm.com.br' })}
          </>
        )}

        {activeTab === 'redes' && (
          <>
            <h2 className="text-base font-bold text-dark-900 flex items-center gap-2">
              <Share2 size={18} className="text-brand-500" /> Redes Sociais
            </h2>
            {field('Instagram', 'instagram_url', { placeholder: 'https://instagram.com/foztourismosm' })}
            {field('Facebook', 'facebook_url', { placeholder: 'https://facebook.com/foztourismosm' })}
          </>
        )}

        {activeTab === 'seo' && (
          <>
            <h2 className="text-base font-bold text-dark-900 flex items-center gap-2">
              <Search size={18} className="text-brand-500" /> SEO Padrão
            </h2>
            {field('Título Padrão', 'seo_default_title', {
              placeholder: 'Foz Turismo SM - Sua Viagem Começa Aqui',
              hint: 'Exibido na aba do navegador e nos resultados de busca.'
            })}
            {field('Descrição Padrão', 'seo_default_description', {
              placeholder: 'A melhor agência de turismo de Foz do Iguaçu...',
              hint: 'Ideal entre 120 e 160 caracteres.',
              textarea: true
            })}
            {field('Palavras-chave', 'seo_keywords', {
              placeholder: 'Foz Turismo SM, Cataratas, Turismo Foz do Iguaçu',
              hint: 'Separadas por vírgula.'
            })}
          </>
        )}

        {activeTab === 'integracoes' && (
          <>
            <h2 className="text-base font-bold text-dark-900 flex items-center gap-2">
              <Cpu size={18} className="text-brand-500" /> Integrações
            </h2>
            {field('Google / Meta Pixel ID', 'google_pixel_id', {
              placeholder: 'Ex: 1234567890',
              hint: 'Deixe em branco para desativar o pixel.'
            })}
          </>
        )}
      </div>

      {/* Rodapé de ação */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {status === 'success' && (
            <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 size={18} /> Configurações salvas com sucesso!
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <AlertCircle size={18} /> Erro ao salvar. Tente novamente.
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
