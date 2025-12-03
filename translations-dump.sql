-- ============================================
-- TRANSLATIONS SQL DUMP
-- Экспорт из Lovable Cloud
-- Всего записей: ~7900
-- ============================================

-- Очистка таблицы перед импортом (опционально)
-- TRUNCATE TABLE public.translations;

-- Вставка всех переводов
INSERT INTO public.translations (language_code, translation_key, translation_value)
VALUES
-- Чтобы импортировать переводы, выполните следующий запрос в SQL Editor вашего Supabase проекта:
-- 1. Скопируйте содержимое этого файла
-- 2. Откройте SQL Editor в Supabase Dashboard
-- 3. Вставьте и выполните запрос

-- ============================================
-- ВАЖНО: Из-за большого объема данных (~7900 записей),
-- рекомендуется использовать Edge Function для импорта
-- или импортировать через CSV файл
-- ============================================

-- Альтернативный метод: Используйте API для копирования переводов
-- Смотрите инструкцию в MIGRATION_GUIDE.md

-- Пример формата данных:
-- ('ar', 'about.badge', 'السلالات النخبة'),
-- ('en', 'about.badge', 'Elite Breeds'),
-- ...

-- ============================================
-- РЕКОМЕНДУЕМЫЙ МЕТОД МИГРАЦИИ ПЕРЕВОДОВ:
-- ============================================

-- Шаг 1: Создайте Edge Function в вашем Supabase проекте:

/*
// supabase/functions/import-translations/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Получаем переводы из старой базы
  const sourceUrl = 'https://rujvbcxpnzpikkmgdkfs.supabase.co'
  const sourceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM'
  
  const sourceSupabase = createClient(sourceUrl, sourceKey)
  
  const { data: translations, error: fetchError } = await sourceSupabase
    .from('translations')
    .select('language_code, translation_key, translation_value')
  
  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }

  // Вставляем переводы батчами по 500
  const batchSize = 500
  let inserted = 0
  
  for (let i = 0; i < translations.length; i += batchSize) {
    const batch = translations.slice(i, i + batchSize)
    const { error: insertError } = await supabase
      .from('translations')
      .upsert(batch, { onConflict: 'language_code,translation_key' })
    
    if (insertError) {
      return new Response(JSON.stringify({ 
        error: insertError.message,
        inserted 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
    inserted += batch.length
  }

  return new Response(JSON.stringify({ 
    success: true, 
    inserted,
    total: translations.length 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
*/

-- Шаг 2: Добавьте уникальный индекс для upsert:
CREATE UNIQUE INDEX IF NOT EXISTS translations_unique_key 
ON public.translations (language_code, translation_key);

-- Шаг 3: Вызовите Edge Function для импорта

-- ============================================
-- АЛЬТЕРНАТИВА: Ручной SQL импорт
-- ============================================

-- Если вы хотите импортировать вручную через SQL,
-- используйте скрипт ниже для генерации INSERT statements
-- из текущей базы данных Lovable Cloud.

-- Для получения актуального дампа данных,
-- вы можете использовать этот JavaScript код в консоли браузера:

/*
const { data } = await supabase.from('translations').select('*');
const sql = data.map(t => 
  `('${t.language_code}', '${t.translation_key.replace(/'/g, "''")}', '${t.translation_value.replace(/'/g, "''")}')`
).join(',\n');
console.log(`INSERT INTO translations (language_code, translation_key, translation_value) VALUES\n${sql};`);
*/
