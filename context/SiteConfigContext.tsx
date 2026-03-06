'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Banner, SiteSettings } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface SiteConfigContextType {
  // Banners
  banners: Banner[];
  updateBanners: (banners: Banner[]) => void;
  addBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;
  // Configurações do site
  settings: SiteSettings | null;
  settingsLoading: boolean;
  refetchSettings: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

const DEFAULT_BANNERS: Banner[] = [
  {
    id: '1',
    desktop_url: 'https://images.unsplash.com/photo-1583508915931-1e4a82c6d7a4?q=80&w=2000&auto=format&fit=crop',
    mobile_url: 'https://images.unsplash.com/photo-1583508915931-1e4a82c6d7a4?q=80&w=800&auto=format&fit=crop',
    title: 'Cataratas do Iguaçu',
    link: '/product/1',
    active: true
  },
  {
    id: '2',
    desktop_url: 'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?q=80&w=2000&auto=format&fit=crop',
    mobile_url: 'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?q=80&w=800&auto=format&fit=crop',
    title: 'Compras no Paraguai',
    link: '/product/2',
    active: true
  }
];

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Carrega banners do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBanners = localStorage.getItem('foztursm_banners');
      if (savedBanners) {
        try {
          setBanners(JSON.parse(savedBanners));
        } catch {
          setBanners(DEFAULT_BANNERS);
        }
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    }
  }, []);

  // Persiste banners no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && banners.length > 0) {
      localStorage.setItem('foztursm_banners', JSON.stringify(banners));
    }
  }, [banners]);

  // Busca configurações do Supabase
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data as SiteSettings);
    } catch (err) {
      console.error('[SiteConfig] Erro ao buscar configurações:', err);
      setSettings(null);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateBanners = (newBanners: Banner[]) => setBanners(newBanners);
  const addBanner = (banner: Banner) => setBanners(prev => [...prev, banner]);
  const removeBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  return (
    <SiteConfigContext.Provider value={{
      banners, updateBanners, addBanner, removeBanner,
      settings, settingsLoading, refetchSettings: fetchSettings,
    }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  return context;
};
