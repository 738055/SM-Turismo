async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  if (!text || typeof text !== 'string') return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    return text;
  } catch (error) {
    console.error(`Erro ao traduzir para ${targetLang}:`, error);
    return text;
  }
}

async function translateArray(arr: string[] | undefined, targetLang: string): Promise<string[]> {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return [];
  const promises = arr.map(item => fetchTranslation(item, targetLang));
  return Promise.all(promises);
}

export async function autoTranslate(entity: any, type: 'product' | 'category' | 'banner' | 'itinerary') {
  const languages = ['en', 'es'];
  const newEntity = { ...entity };

  for (const lang of languages) {
    if (type === 'product') {
      if (entity.title) newEntity[`title_${lang}`] = await fetchTranslation(entity.title, lang);
      if (entity.description) newEntity[`description_${lang}`] = await fetchTranslation(entity.description, lang);
      if (entity.full_description) newEntity[`full_description_${lang}`] = await fetchTranslation(entity.full_description, lang);
      if (entity.duration) newEntity[`duration_${lang}`] = await fetchTranslation(entity.duration, lang);
      if (entity.amenities?.length) newEntity[`amenities_${lang}`] = await translateArray(entity.amenities, lang);
      if (entity.excludes?.length) newEntity[`excludes_${lang}`] = await translateArray(entity.excludes, lang);
      
      if (entity.itinerary?.length) {
        newEntity.itinerary = await Promise.all(entity.itinerary.map(async (item: any) => ({
          ...item,
          [`title_${lang}`]: await fetchTranslation(item.title, lang),
          [`description_${lang}`]: await fetchTranslation(item.description, lang)
        })));
      }
    }

    if (type === 'category') {
      if (entity.name) newEntity[`name_${lang}`] = await fetchTranslation(entity.name, lang);
    }

    if (type === 'banner') {
      if (entity.title) newEntity[`title_${lang}`] = await fetchTranslation(entity.title, lang);
    }

    if (type === 'itinerary') {
      if (entity.title) newEntity[`title_${lang}`] = await fetchTranslation(entity.title, lang);
      if (entity.description) newEntity[`description_${lang}`] = await fetchTranslation(entity.description, lang);
    }
  }

  return newEntity;
}