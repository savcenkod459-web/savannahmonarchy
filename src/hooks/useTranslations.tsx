import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n/config';

// Флаг для предотвращения множественных загрузок
let isLoading = false;
let isLoaded = false;

const loadTranslationsFromDatabase = async () => {
  if (isLoading || isLoaded) return;
  isLoading = true;

  try {
    console.log('🔄 Загружаем переводы из базы данных...');
    
    const { data, error } = await supabase
      .from('translations')
      .select('*');

    if (error) {
      console.error('❌ Ошибка загрузки переводов:', error);
      isLoading = false;
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Нет переводов в базе данных');
      isLoading = false;
      isLoaded = true;
      return;
    }

    console.log(`📊 Найдено ${data.length} переводов в базе данных`);

    // Группируем переводы по языкам
    const translationsByLang: Record<string, Record<string, string>> = {};

    data.forEach((translation) => {
      if (!translationsByLang[translation.language_code]) {
        translationsByLang[translation.language_code] = {};
      }
      translationsByLang[translation.language_code][translation.translation_key] = 
        translation.translation_value;
    });

    console.log('📦 Переводы по языкам:', Object.keys(translationsByLang).map(lang => 
      `${lang}: ${Object.keys(translationsByLang[lang]).length} ключей`
    ));

    // Добавляем переводы в i18next для каждого языка
    Object.keys(translationsByLang).forEach((lang) => {
      const existingResources = i18n.getResourceBundle(lang, 'translation') || {};
      const mergedResources = {
        ...existingResources,
        ...translationsByLang[lang]
      };
      
      i18n.addResourceBundle(lang, 'translation', mergedResources, true, true);
      console.log(`✅ Добавлены переводы для языка ${lang}`);
    });

    // Форсируем обновление текущего языка чтобы применить новые переводы
    const currentLang = i18n.language;
    await i18n.changeLanguage(currentLang);
    
    console.log('✅ Переводы успешно загружены и применены!');
    isLoaded = true;
  } catch (error) {
    console.error('❌ Ошибка в loadTranslationsFromDatabase:', error);
  } finally {
    isLoading = false;
  }
};

// Инициализация при загрузке модуля
if (i18n.isInitialized) {
  loadTranslationsFromDatabase();
} else {
  i18n.on('initialized', loadTranslationsFromDatabase);
}

export const useTranslations = () => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Загружаем переводы если ещё не загружены
    if (!isLoaded && !isLoading) {
      loadTranslationsFromDatabase();
    }

    // Подписываемся на изменения переводов в реальном времени
    if (!channelRef.current) {
      channelRef.current = supabase
        .channel('translations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'translations'
          },
          async () => {
            isLoaded = false;
            await loadTranslationsFromDatabase();
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
};
