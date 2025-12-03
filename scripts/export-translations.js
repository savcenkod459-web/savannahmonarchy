/**
 * Скрипт экспорта данных из Lovable Cloud в JSON
 * 
 * Запуск: node scripts/export-translations.js
 * 
 * Требования: Node.js 18+ (для fetch API)
 */

const SUPABASE_URL = 'https://rujvbcxpnzpikkmgdkfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM';

async function fetchTable(tableName, orderBy = 'created_at') {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}?select=*&order=${orderBy}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error for ${tableName}: ${response.status}`);
  }
  return response.json();
}

async function exportAllData() {
  console.log('🔄 Начинаем экспорт данных...\n');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  const exportDir = './exports';
  await fs.mkdir(exportDir, { recursive: true });

  try {
    // === TRANSLATIONS ===
    console.log('📋 Экспорт переводов...');
    const translations = await fetchTable('translations', 'language_code,translation_key');
    console.log(`   ✅ Получено ${translations.length} переводов`);

    // Группируем по языкам
    const byLanguage = {};
    translations.forEach((t) => {
      if (!byLanguage[t.language_code]) {
        byLanguage[t.language_code] = {};
      }
      byLanguage[t.language_code][t.translation_key] = t.translation_value;
    });

    // Сохраняем переводы
    await fs.writeFile(path.join(exportDir, 'translations-full.json'), JSON.stringify(translations, null, 2));
    await fs.writeFile(path.join(exportDir, 'translations-by-language.json'), JSON.stringify(byLanguage, null, 2));
    
    for (const [lang, keys] of Object.entries(byLanguage)) {
      await fs.writeFile(path.join(exportDir, `translations-${lang}.json`), JSON.stringify(keys, null, 2));
    }

    // SQL для переводов
    const translationsSql = translations.map((t) => {
      const key = t.translation_key.replace(/'/g, "''");
      const value = t.translation_value.replace(/'/g, "''");
      return `('${t.language_code}', '${key}', '${value}')`;
    });
    await fs.writeFile(path.join(exportDir, 'translations-import.sql'), `INSERT INTO public.translations (language_code, translation_key, translation_value) VALUES\n${translationsSql.join(',\n')}\nON CONFLICT (language_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value, updated_at = now();`);

    // === SITE IMAGES ===
    console.log('🖼️  Экспорт site_images...');
    const siteImages = await fetchTable('site_images', 'page,section,display_order');
    console.log(`   ✅ Получено ${siteImages.length} записей`);
    
    await fs.writeFile(path.join(exportDir, 'site_images.json'), JSON.stringify(siteImages, null, 2));
    
    const siteImagesSql = siteImages.map((img) => {
      const altText = img.alt_text ? `'${img.alt_text.replace(/'/g, "''")}'` : 'NULL';
      return `('${img.page}', '${img.section}', '${img.image_url}', ${altText}, ${img.display_order || 0})`;
    });
    await fs.writeFile(path.join(exportDir, 'site_images-import.sql'), `INSERT INTO public.site_images (page, section, image_url, alt_text, display_order) VALUES\n${siteImagesSql.join(',\n')};`);

    // === CONTACT MESSAGES ===
    console.log('📧 Экспорт contact_messages...');
    const contactMessages = await fetchTable('contact_messages', 'created_at.desc');
    console.log(`   ✅ Получено ${contactMessages.length} сообщений`);
    
    await fs.writeFile(path.join(exportDir, 'contact_messages.json'), JSON.stringify(contactMessages, null, 2));
    
    const contactSql = contactMessages.map((msg) => {
      const name = msg.name.replace(/'/g, "''");
      const email = msg.email.replace(/'/g, "''");
      const phone = msg.phone ? `'${msg.phone.replace(/'/g, "''")}'` : 'NULL';
      const message = msg.message.replace(/'/g, "''");
      return `('${msg.created_at}', '${name}', '${email}', ${phone}, '${message}', ${msg.read})`;
    });
    if (contactSql.length > 0) {
      await fs.writeFile(path.join(exportDir, 'contact_messages-import.sql'), `INSERT INTO public.contact_messages (created_at, name, email, phone, message, read) VALUES\n${contactSql.join(',\n')};`);
    }

    // === SUMMARY ===
    console.log('\n📊 Итого:');
    console.log(`   Переводы: ${translations.length} (${Object.keys(byLanguage).length} языков)`);
    console.log(`   Site Images: ${siteImages.length}`);
    console.log(`   Contact Messages: ${contactMessages.length}`);
    console.log(`\n✅ Все файлы сохранены в: ${exportDir}/`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

exportAllData();
