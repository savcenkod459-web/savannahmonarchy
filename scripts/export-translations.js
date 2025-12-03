/**
 * Скрипт экспорта переводов из Lovable Cloud в JSON
 * 
 * Запуск: node scripts/export-translations.js
 * 
 * Требования: Node.js 18+ (для fetch API)
 */

const SUPABASE_URL = 'https://rujvbcxpnzpikkmgdkfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM';

async function exportTranslations() {
  console.log('🔄 Начинаем экспорт переводов...\n');

  try {
    // Получаем все переводы
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/translations?select=language_code,translation_key,translation_value&order=language_code,translation_key`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const translations = await response.json();
    console.log(`✅ Получено ${translations.length} переводов\n`);

    // Группируем по языкам
    const byLanguage = {};
    translations.forEach((t) => {
      if (!byLanguage[t.language_code]) {
        byLanguage[t.language_code] = {};
      }
      byLanguage[t.language_code][t.translation_key] = t.translation_value;
    });

    // Статистика
    console.log('📊 Статистика по языкам:');
    Object.entries(byLanguage).forEach(([lang, keys]) => {
      console.log(`   ${lang}: ${Object.keys(keys).length} ключей`);
    });

    // Сохраняем в файлы
    const fs = await import('fs/promises');
    const path = await import('path');

    // Создаём директорию для экспорта
    const exportDir = './exports';
    await fs.mkdir(exportDir, { recursive: true });

    // 1. Полный экспорт (массив)
    const fullExportPath = path.join(exportDir, 'translations-full.json');
    await fs.writeFile(fullExportPath, JSON.stringify(translations, null, 2));
    console.log(`\n📁 Полный экспорт: ${fullExportPath}`);

    // 2. Экспорт по языкам (объект)
    const byLangPath = path.join(exportDir, 'translations-by-language.json');
    await fs.writeFile(byLangPath, JSON.stringify(byLanguage, null, 2));
    console.log(`📁 По языкам: ${byLangPath}`);

    // 3. Отдельные файлы для каждого языка
    for (const [lang, keys] of Object.entries(byLanguage)) {
      const langPath = path.join(exportDir, `translations-${lang}.json`);
      await fs.writeFile(langPath, JSON.stringify(keys, null, 2));
      console.log(`📁 ${lang}: ${langPath}`);
    }

    // 4. SQL для импорта
    const sqlStatements = translations.map((t) => {
      const key = t.translation_key.replace(/'/g, "''");
      const value = t.translation_value.replace(/'/g, "''");
      return `('${t.language_code}', '${key}', '${value}')`;
    });

    const sqlContent = `-- Импорт переводов
-- Всего записей: ${translations.length}

-- Сначала создайте уникальный индекс (если его нет):
CREATE UNIQUE INDEX IF NOT EXISTS translations_unique_key 
ON public.translations (language_code, translation_key);

-- Затем выполните INSERT с ON CONFLICT:
INSERT INTO public.translations (language_code, translation_key, translation_value)
VALUES
${sqlStatements.join(',\n')}
ON CONFLICT (language_code, translation_key) 
DO UPDATE SET translation_value = EXCLUDED.translation_value, updated_at = now();
`;

    const sqlPath = path.join(exportDir, 'translations-import.sql');
    await fs.writeFile(sqlPath, sqlContent);
    console.log(`📁 SQL импорт: ${sqlPath}`);

    console.log('\n✅ Экспорт завершён успешно!');
    console.log(`\n📌 Файлы сохранены в директории: ${exportDir}/`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

exportTranslations();
