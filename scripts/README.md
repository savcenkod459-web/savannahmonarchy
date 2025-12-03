# Экспорт данных из Supabase

Скрипт для экспорта всех данных проекта Savannah Monarchy из базы данных Supabase.

## Требования

- Node.js 18+
- npm или bun

## Экспортируемые таблицы

| Таблица | Требует SERVICE_ROLE_KEY |
|---------|--------------------------|
| cats | ❌ |
| cat_pedigrees | ❌ |
| translations | ❌ |
| site_images | ❌ |
| contact_messages | ❌ |
| profiles | ✅ |
| user_roles | ✅ |
| password_reset_codes | ✅ |

## Запуск

### Базовый экспорт (публичные таблицы)

```bash
node scripts/export-data.js
```

### Полный экспорт (все таблицы)

Для экспорта таблиц с RLS-политиками нужен `SERVICE_ROLE_KEY`:

```bash
SERVICE_ROLE_KEY=your_service_role_key node scripts/export-data.js
```

## Где получить SERVICE_ROLE_KEY

1. Откройте настройки проекта в Lovable
2. Перейдите в раздел **Integrations → Lovable Cloud**
3. Найдите **Service Role Key** в настройках

⚠️ **Важно:** Никогда не публикуйте SERVICE_ROLE_KEY в репозитории!

## Результат экспорта

После выполнения в папке `exports/` появятся файлы:

```
exports/
├── cats.json                      # Данные котов (JSON)
├── cats-import.sql                # SQL для импорта котов
├── cat_pedigrees.json             # Родословные (JSON)
├── cat_pedigrees-import.sql       # SQL для импорта родословных
├── translations.json              # Переводы (JSON)
├── translations-import.sql        # SQL для импорта переводов
├── site_images.json               # Изображения сайта (JSON)
├── site_images-import.sql         # SQL для импорта изображений
├── contact_messages.json          # Сообщения (JSON)
├── contact_messages-import.sql    # SQL для импорта сообщений
├── profiles.json                  # Профили пользователей (JSON)*
├── profiles-import.sql            # SQL для импорта профилей*
├── user_roles.json                # Роли пользователей (JSON)*
├── user_roles-import.sql          # SQL для импорта ролей*
├── password_reset_codes.json      # Коды сброса паролей (JSON)*
└── password_reset_codes-import.sql # SQL для импорта кодов*
```

\* — только при наличии SERVICE_ROLE_KEY

## Импорт данных

Для импорта данных в новую базу выполните SQL-файлы в следующем порядке:

1. `cats-import.sql`
2. `cat_pedigrees-import.sql`
3. `translations-import.sql`
4. `site_images-import.sql`
5. `contact_messages-import.sql`
6. `profiles-import.sql` (если есть)
7. `user_roles-import.sql` (если есть)
8. `password_reset_codes-import.sql` (если есть)

## Устранение неполадок

### Ошибка "fetch is not defined"

Убедитесь, что используете Node.js версии 18 или выше:

```bash
node --version
```

### Пустые таблицы profiles/user_roles

Проверьте, что передали корректный SERVICE_ROLE_KEY.

### Ошибка подключения

Проверьте интернет-соединение и доступность Supabase.
