'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
}

const SeoHead: React.FC<SeoHeadProps> = ({ title, description, image, keywords }) => {
  const pathname = usePathname();
  const { settings } = useSiteConfig();

  const resolvedTitle = title || settings?.seo_default_title || 'Foz Turismo SM';
  const resolvedDescription = description || settings?.seo_default_description || '';

  useEffect(() => {
    document.title = `${resolvedTitle} | Foz Turismo SM`;
    
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', resolvedDescription);
    if (image) setMeta('og:image', image);
    setMeta('og:title', resolvedTitle);
    setMeta('og:description', resolvedDescription);
    setMeta('og:url', window.location.href);

    if (keywords && keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }

    console.log(`[Analytics] Page View: ${pathname}`);

  }, [resolvedTitle, resolvedDescription, image, keywords, pathname]);

  return null;
};

export default SeoHead;