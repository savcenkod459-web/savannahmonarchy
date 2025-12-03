import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Исходная база данных Lovable Cloud
const SOURCE_URL = 'https://rujvbcxpnzpikkmgdkfs.supabase.co'
const SOURCE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('🚀 Начинаем импорт переводов из Lovable Cloud...')

  try {
    // Целевая база данных (ваш новый Supabase проект)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const targetSupabase = createClient(supabaseUrl, supabaseKey)

    // Подключаемся к исходной базе (Lovable Cloud)
    const sourceSupabase = createClient(SOURCE_URL, SOURCE_KEY)

    // Получаем все переводы из исходной базы
    console.log('📥 Загружаем переводы из Lovable Cloud...')
    const { data: translations, error: fetchError } = await sourceSupabase
      .from('translations')
      .select('language_code, translation_key, translation_value')
      .order('language_code')
      .order('translation_key')

    if (fetchError) {
      console.error('❌ Ошибка загрузки:', fetchError.message)
      return new Response(JSON.stringify({ 
        success: false,
        error: fetchError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    if (!translations || translations.length === 0) {
      console.log('⚠️ Нет переводов для импорта')
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No translations to import',
        inserted: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📊 Найдено ${translations.length} переводов`)

    // Статистика по языкам
    const langStats: Record<string, number> = {}
    translations.forEach(t => {
      langStats[t.language_code] = (langStats[t.language_code] || 0) + 1
    })
    console.log('📈 По языкам:', JSON.stringify(langStats))

    // Вставляем переводы батчами по 500 записей
    const batchSize = 500
    let inserted = 0
    let errors: string[] = []

    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(translations.length / batchSize)
      
      console.log(`📦 Обрабатываем батч ${batchNum}/${totalBatches} (${batch.length} записей)`)

      // Используем upsert для обновления существующих записей
      const { error: insertError, count } = await targetSupabase
        .from('translations')
        .upsert(batch, { 
          onConflict: 'language_code,translation_key',
          ignoreDuplicates: false 
        })

      if (insertError) {
        console.error(`❌ Ошибка батча ${batchNum}:`, insertError.message)
        errors.push(`Batch ${batchNum}: ${insertError.message}`)
        
        // Пробуем вставить по одному в случае ошибки
        console.log('🔄 Пробуем вставить записи по одной...')
        for (const translation of batch) {
          const { error: singleError } = await targetSupabase
            .from('translations')
            .upsert(translation, { 
              onConflict: 'language_code,translation_key',
              ignoreDuplicates: false 
            })
          
          if (!singleError) {
            inserted++
          }
        }
      } else {
        inserted += batch.length
        console.log(`✅ Батч ${batchNum} успешно импортирован`)
      }
    }

    const result = {
      success: errors.length === 0,
      message: errors.length === 0 
        ? 'Все переводы успешно импортированы'
        : 'Импорт завершён с некоторыми ошибками',
      stats: {
        total: translations.length,
        inserted,
        byLanguage: langStats
      },
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('🎉 Импорт завершён:', JSON.stringify(result))

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 Критическая ошибка:', errorMessage)
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
