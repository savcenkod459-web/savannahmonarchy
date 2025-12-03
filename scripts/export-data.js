/**
 * Скрипт экспорта данных из Lovable Cloud в JSON/SQL
 * 
 * Запуск: node scripts/export-data.js
 * 
 * Для экспорта profiles и user_roles установите SERVICE_ROLE_KEY:
 *   SERVICE_ROLE_KEY=your_key node scripts/export-data.js
 * 
 * Требования: Node.js 18+ (для fetch API)
 */

const SUPABASE_URL = 'https://rujvbcxpnzpikkmgdkfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

async function fetchTable(tableName, orderBy = 'created_at', useServiceKey = false) {
  const apiKey = useServiceKey && SERVICE_ROLE_KEY ? SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}?select=*&order=${orderBy}`,
    {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 404 || response.status === 403) {
      return []; // RLS blocked or table not accessible
    }
    throw new Error(`HTTP error for ${tableName}: ${response.status}`);
  }
  return response.json();
}

function escapeSQL(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return `'{${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(',')}}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function exportAllData() {
  console.log('🔄 Начинаем экспорт данных...\n');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  const exportDir = './exports';
  await fs.mkdir(exportDir, { recursive: true });

  try {
    // === CATS ===
    console.log('🐱 Экспорт cats...');
    const cats = await fetchTable('cats', 'created_at');
    console.log(`   ✅ Получено ${cats.length} котов`);
    
    await fs.writeFile(path.join(exportDir, 'cats.json'), JSON.stringify(cats, null, 2));
    
    const catsSql = cats.map((cat) => {
      return `(${escapeSQL(cat.name)}, ${escapeSQL(cat.breed)}, ${escapeSQL(cat.age)}, ${escapeSQL(cat.gender)}, ${escapeSQL(cat.image)}, ${escapeSQL(cat.description)}, ${escapeSQL(cat.traits)}, ${cat.price}, ${escapeSQL(cat.additional_images)}, ${escapeSQL(cat.video)}, ${escapeSQL(cat.video_poster)})`;
    });
    await fs.writeFile(path.join(exportDir, 'cats-import.sql'), `INSERT INTO public.cats (name, breed, age, gender, image, description, traits, price, additional_images, video, video_poster) VALUES\n${catsSql.join(',\n')};`);

    // === CAT PEDIGREES ===
    console.log('📜 Экспорт cat_pedigrees...');
    const pedigrees = await fetchTable('cat_pedigrees', 'created_at');
    console.log(`   ✅ Получено ${pedigrees.length} записей родословных`);
    
    await fs.writeFile(path.join(exportDir, 'cat_pedigrees.json'), JSON.stringify(pedigrees, null, 2));
    
    // Примечание: cat_id нужно будет заменить на новые ID после импорта cats
    const pedigreesSql = pedigrees.map((p) => {
      return `(${escapeSQL(p.cat_id)}, ${escapeSQL(p.parent_type)}, ${escapeSQL(p.parent_name)}, ${escapeSQL(p.parent_breed)}, ${escapeSQL(p.parent_description)}, ${escapeSQL(p.parent_images)})`;
    });
    await fs.writeFile(path.join(exportDir, 'cat_pedigrees-import.sql'), `-- ВАЖНО: Замените cat_id на актуальные ID после импорта таблицы cats!\nINSERT INTO public.cat_pedigrees (cat_id, parent_type, parent_name, parent_breed, parent_description, parent_images) VALUES\n${pedigreesSql.join(',\n')};`);

    // === TRANSLATIONS ===
    console.log('📋 Экспорт translations...');
    const translations = await fetchTable('translations', 'language_code,translation_key');
    console.log(`   ✅ Получено ${translations.length} переводов`);

    const byLanguage = {};
    translations.forEach((t) => {
      if (!byLanguage[t.language_code]) {
        byLanguage[t.language_code] = {};
      }
      byLanguage[t.language_code][t.translation_key] = t.translation_value;
    });

    await fs.writeFile(path.join(exportDir, 'translations-full.json'), JSON.stringify(translations, null, 2));
    await fs.writeFile(path.join(exportDir, 'translations-by-language.json'), JSON.stringify(byLanguage, null, 2));
    
    for (const [lang, keys] of Object.entries(byLanguage)) {
      await fs.writeFile(path.join(exportDir, `translations-${lang}.json`), JSON.stringify(keys, null, 2));
    }

    const translationsSql = translations.map((t) => {
      return `(${escapeSQL(t.language_code)}, ${escapeSQL(t.translation_key)}, ${escapeSQL(t.translation_value)})`;
    });
    await fs.writeFile(path.join(exportDir, 'translations-import.sql'), `INSERT INTO public.translations (language_code, translation_key, translation_value) VALUES\n${translationsSql.join(',\n')}\nON CONFLICT (language_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value, updated_at = now();`);

    // === SITE IMAGES ===
    console.log('🖼️  Экспорт site_images...');
    const siteImages = await fetchTable('site_images', 'page,section,display_order');
    console.log(`   ✅ Получено ${siteImages.length} записей`);
    
    await fs.writeFile(path.join(exportDir, 'site_images.json'), JSON.stringify(siteImages, null, 2));
    
    const siteImagesSql = siteImages.map((img) => {
      return `(${escapeSQL(img.page)}, ${escapeSQL(img.section)}, ${escapeSQL(img.image_url)}, ${escapeSQL(img.alt_text)}, ${img.display_order || 0})`;
    });
    await fs.writeFile(path.join(exportDir, 'site_images-import.sql'), `INSERT INTO public.site_images (page, section, image_url, alt_text, display_order) VALUES\n${siteImagesSql.join(',\n')};`);

    // === CONTACT MESSAGES ===
    console.log('📧 Экспорт contact_messages...');
    const contactMessages = await fetchTable('contact_messages', 'created_at.desc');
    console.log(`   ✅ Получено ${contactMessages.length} сообщений`);
    
    await fs.writeFile(path.join(exportDir, 'contact_messages.json'), JSON.stringify(contactMessages, null, 2));
    
    if (contactMessages.length > 0) {
      const contactSql = contactMessages.map((msg) => {
        return `(${escapeSQL(msg.created_at)}, ${escapeSQL(msg.name)}, ${escapeSQL(msg.email)}, ${escapeSQL(msg.phone)}, ${escapeSQL(msg.message)}, ${msg.read})`;
      });
      await fs.writeFile(path.join(exportDir, 'contact_messages-import.sql'), `INSERT INTO public.contact_messages (created_at, name, email, phone, message, read) VALUES\n${contactSql.join(',\n')};`);
    }

    // === PROFILES (requires SERVICE_ROLE_KEY) ===
    let profiles = [];
    if (SERVICE_ROLE_KEY) {
      console.log('👤 Экспорт profiles...');
      profiles = await fetchTable('profiles', 'created_at', true);
      console.log(`   ✅ Получено ${profiles.length} профилей`);
      
      await fs.writeFile(path.join(exportDir, 'profiles.json'), JSON.stringify(profiles, null, 2));
      
      if (profiles.length > 0) {
        const profilesSql = profiles.map((p) => {
          return `(${escapeSQL(p.id)}, ${escapeSQL(p.email)}, ${escapeSQL(p.first_name)}, ${escapeSQL(p.last_name)}, ${escapeSQL(p.phone)}, ${escapeSQL(p.avatar_url)}, ${escapeSQL(p.bio)})`;
        });
        await fs.writeFile(path.join(exportDir, 'profiles-import.sql'), `-- ВАЖНО: user_id должен существовать в auth.users!\nINSERT INTO public.profiles (id, email, first_name, last_name, phone, avatar_url, bio) VALUES\n${profilesSql.join(',\n')}\nON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, avatar_url = EXCLUDED.avatar_url, bio = EXCLUDED.bio;`);
      }
    } else {
      console.log('👤 Пропуск profiles (нужен SERVICE_ROLE_KEY)');
    }

    // === USER ROLES (requires SERVICE_ROLE_KEY) ===
    let userRoles = [];
    if (SERVICE_ROLE_KEY) {
      console.log('🔐 Экспорт user_roles...');
      userRoles = await fetchTable('user_roles', 'created_at', true);
      console.log(`   ✅ Получено ${userRoles.length} ролей`);
      
      await fs.writeFile(path.join(exportDir, 'user_roles.json'), JSON.stringify(userRoles, null, 2));
      
      if (userRoles.length > 0) {
        const rolesSql = userRoles.map((r) => {
          return `(${escapeSQL(r.user_id)}, ${escapeSQL(r.role)})`;
        });
        await fs.writeFile(path.join(exportDir, 'user_roles-import.sql'), `-- ВАЖНО: user_id должен существовать в auth.users!\nINSERT INTO public.user_roles (user_id, role) VALUES\n${rolesSql.join(',\n')}\nON CONFLICT (user_id, role) DO NOTHING;`);
      }
    } else {
      console.log('🔐 Пропуск user_roles (нужен SERVICE_ROLE_KEY)');
    }

    // === SUMMARY ===
    console.log('\n' + '='.repeat(50));
    console.log('📊 ИТОГО ЭКСПОРТИРОВАНО:');
    console.log('='.repeat(50));
    console.log(`   🐱 Cats: ${cats.length}`);
    console.log(`   📜 Cat Pedigrees: ${pedigrees.length}`);
    console.log(`   📋 Translations: ${translations.length} (${Object.keys(byLanguage).length} языков)`);
    console.log(`   🖼️  Site Images: ${siteImages.length}`);
    console.log(`   📧 Contact Messages: ${contactMessages.length}`);
    console.log(`   👤 Profiles: ${profiles.length}${!SERVICE_ROLE_KEY ? ' (пропущено)' : ''}`);
    console.log(`   🔐 User Roles: ${userRoles.length}${!SERVICE_ROLE_KEY ? ' (пропущено)' : ''}`);
    console.log('='.repeat(50));
    console.log(`\n✅ Все файлы сохранены в: ${exportDir}/`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

exportAllData();
