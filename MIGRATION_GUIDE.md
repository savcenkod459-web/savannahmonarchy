# Полная инструкция по миграции на внешний Supabase

## Шаг 1: Создание нового Supabase проекта

1. Перейдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. Создайте новый проект
3. Запишите:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **Anon Key** (публичный ключ)
   - **Service Role Key** (секретный ключ для edge functions)

---

## Шаг 2: Создание схемы базы данных

Выполните в SQL Editor нового Supabase проекта:

### 2.1 Создание типов и функций

```sql
-- Создание enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Функция проверки ролей
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Функция проверки лимита сообщений
CREATE OR REPLACE FUNCTION public.check_message_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count integer;
BEGIN
  SELECT COUNT(*) INTO message_count
  FROM public.contact_messages
  WHERE email = user_email
    AND created_at > NOW() - INTERVAL '1 hour';
  RETURN COALESCE(message_count < 3, true);
END;
$$;

-- Функция очистки просроченных кодов
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_codes
  WHERE expires_at < NOW() OR used = TRUE AND created_at < NOW() - INTERVAL '1 hour';
END;
$$;
```

### 2.2 Создание таблиц

```sql
-- Таблица профилей
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Таблица котов
CREATE TABLE public.cats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  traits TEXT[] NOT NULL,
  price NUMERIC NOT NULL,
  additional_images TEXT[] DEFAULT '{}'::text[],
  video TEXT,
  video_poster TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица родословных
CREATE TABLE public.cat_pedigrees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id UUID NOT NULL,
  parent_type TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_breed TEXT NOT NULL,
  parent_description TEXT,
  parent_images TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица переводов
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code VARCHAR NOT NULL,
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица изображений сайта
CREATE TABLE public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица контактных сообщений
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица кодов сброса пароля
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2.3 Включение RLS и создание политик

```sql
-- Включение RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_pedigrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles can only be created by system" ON public.profiles FOR INSERT WITH CHECK (false);
CREATE POLICY "Profiles cannot be deleted by users" ON public.profiles FOR DELETE USING (false);
CREATE POLICY "Deny anonymous access to profiles" ON public.profiles FOR SELECT USING (false);

-- Политики для user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can assign roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can modify roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can remove roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Deny anonymous access to user_roles" ON public.user_roles FOR SELECT USING (false);

-- Политики для cats
CREATE POLICY "Allow public read access to cats" ON public.cats FOR SELECT USING (true);
CREATE POLICY "Only admins can insert cats" ON public.cats FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update cats" ON public.cats FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete cats" ON public.cats FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Политики для cat_pedigrees
CREATE POLICY "Allow public read access to cat pedigrees" ON public.cat_pedigrees FOR SELECT USING (true);
CREATE POLICY "Only admins can insert cat pedigrees" ON public.cat_pedigrees FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update cat pedigrees" ON public.cat_pedigrees FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete cat pedigrees" ON public.cat_pedigrees FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Политики для translations
CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins can insert translations" ON public.translations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "Admins can update translations" ON public.translations FOR UPDATE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
CREATE POLICY "Admins can delete translations" ON public.translations FOR DELETE USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Политики для site_images
CREATE POLICY "Allow public read access to site images" ON public.site_images FOR SELECT USING (true);
CREATE POLICY "Only admins can insert site images" ON public.site_images FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update site images" ON public.site_images FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete site images" ON public.site_images FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Политики для contact_messages
CREATE POLICY "Only authenticated users can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact messages" ON public.contact_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update contact messages" ON public.contact_messages FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete contact messages" ON public.contact_messages FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Политики для password_reset_codes
CREATE POLICY "System only can manage password reset codes" ON public.password_reset_codes FOR ALL USING (false) WITH CHECK (false);
```

### 2.4 Создание триггера для новых пользователей

```sql
-- Функция обработки новых пользователей
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.5 Создание Storage Bucket

```sql
-- Создание бакета для изображений котов
INSERT INTO storage.buckets (id, name, public) VALUES ('cat-images', 'cat-images', true);

-- Политики для storage
CREATE POLICY "Public read access to cat images" ON storage.objects FOR SELECT USING (bucket_id = 'cat-images');
CREATE POLICY "Admins can upload cat images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cat-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cat images" ON storage.objects FOR UPDATE USING (bucket_id = 'cat-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cat images" ON storage.objects FOR DELETE USING (bucket_id = 'cat-images' AND has_role(auth.uid(), 'admin'));
```

---

## Шаг 3: Импорт данных

### 3.1 Данные котов

```sql
INSERT INTO public.cats (id, name, breed, age, gender, image, description, traits, price, additional_images, video, created_at, updated_at) VALUES
('767e2da6-a802-4fce-824c-fdd17231df79', '', 'Саванна F1', 'Котёнок', 'Мальчик', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126392571-zkhd3.png', 'Шикарный мальчик с ярким пятнистым рисунком и гордой осанкой сервала. Контактный, уверенный и преданный — истинный король среди кошек, излучающий энергию и роскошь.', ARRAY['Престижный', 'Преданный', 'Уверенный', 'Динамичный'], 15999.00, ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126408268-4kd5o.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126416632-z5emu.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126424958-ut298m.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126429372-n030o.png'], 'https://youtu.be/cmYrEMdSKk8?si=veezgoqQvGZfHzDj', '2025-10-01 00:00:00+00', '2025-12-02 17:10:07.649186+00'),

('df1042ed-5f48-440e-8ebe-e4e316f2a247', '', 'Саванна F1', 'Котёнок', 'Мальчик', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760893466973-g1khd.png', 'Редкий мальчик, сочетающий в себе утончённую дикость сервала и домашний характер, с великолепным окрасом и выразительным взглядом, что делает его настоящим украшением.', ARRAY['Великолепный', 'Добрый', 'Ласковый', 'Преданный'], 14999.00, ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760893481475-iaimph.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760893488414-ltyyg.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760893493497-9tzc9s.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760893495719-2a07ze.png'], 'https://youtu.be/QPfh-yWMn2o?si=aA5BFCuHZx6zyt8L', '2025-10-19 16:53:09.105867+00', '2025-11-28 20:13:20.926427+00'),

('49448daa-a2f0-4959-b917-4dd09697d82e', '', 'Саванна F1', 'Котёнок', 'Девочка', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126688165-x42wh9.png', 'Элегантная девочка с мягким блеском шерсти и с характером сервала. Наблюдательная, настойчивая и необыкновенно умная — воплощение природного блеска и  гармонии.', ARRAY['Блестящая', 'Наблюдательная', 'Умная', 'Непокорная'], 15499.00, ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126702096-896fkf.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126714020-xy1ce.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126718344-y5u23.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1760126725001-lq24l9.png'], 'https://youtu.be/Jm9KzQccYjk?si=CNKacQw6-SNoxxy6', '2025-12-03 18:00:00+00', '2025-12-02 17:09:53.945477+00'),

('eebd023b-5565-48da-a0e7-6e3efbf2fb42', '', 'Саванна F1', 'Котёнок', 'Мальчик', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1764691559868-88xs6.png', 'A unique boy with delicate serval energy, a domestic character, luxurious coloring, and confident charisma — creates a refined accent and highlights the taste of a true connoisseur.', ARRAY['Sociable', 'Gentle', 'Harmonious', 'Calmly Confident'], 16299.00, ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1764691594395-a6aqtv.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1764691598623-bx5hi6.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1764691603803-v3idr3.png', 'https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/1764691613645-gknub.png'], 'https://www.youtube.com/embed/5Sc9gnm0nRM', '2025-12-04 00:00:00+00', '2025-12-02 17:39:05.772026+00');
```

### 3.2 Данные родословных

```sql
INSERT INTO public.cat_pedigrees (id, cat_id, parent_type, parent_name, parent_breed, parent_description, parent_images, created_at, updated_at) VALUES
('04b27144-6d00-4ec0-847f-04ac8cd98bf5', '767e2da6-a802-4fce-824c-fdd17231df79', 'father', 'Чирик', 'Сервал', 'Величественный самец с безупречной грацией и насыщенным золотистым окрасом. Его движения точны и плавны, а взгляд — проницательный и уверенный. Обладает благородным темпераментом и мощной энергетикой, передающей потомству дикое очарование и силу истинного африканского хищника', ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/pedigree-1762793984475-9vt5ga.jpeg'], '2025-11-10 17:00:12.407975+00', '2025-11-10 17:00:12.407975+00'),

('186aa26b-0212-41df-a0ba-488d73764fae', 'df1042ed-5f48-440e-8ebe-e4e316f2a247', 'mother', 'Луиза', 'Абиссинская кошка', 'Изящная кошка с тёплым, искрящимся тикингом и тонкими линиями тела. Её утончённый облик сочетается с живым, наблюдательным взглядом и мягким, но решительным характером. Она передаёт потомству яркость окраса, утончённость форм и врождённую грацию истинной королевы кошачьего мира.', ARRAY['https://rujvbcxpnzpikkmgdkfs.supabase.co/storage/v1/object/public/cat-images/pedigree-1762794925084-8mhhv.jpeg'], '2025-11-10 17:18:07.446717+00', '2025-11-10 17:18:07.446717+00');
```

---

## Шаг 4: Настройка секретов

В новом Supabase проекте перейдите в **Settings → Edge Functions** и добавьте секреты:

| Секрет | Описание |
|--------|----------|
| `RESEND_API_KEY` | Ваш API ключ от Resend для отправки email |
| `LOVABLE_API_KEY` | Ключ для AI-переводов (опционально) |
| `FROM_EMAIL` | Email для отправки писем |

---

## Шаг 5: Развертывание Edge Functions

### Установите Supabase CLI:
```bash
npm install -g supabase
```

### Инициализируйте и привяжите проект:
```bash
supabase login
supabase link --project-ref ВАШ_PROJECT_REF
```

### Разверните функции:
```bash
supabase functions deploy send-contact-notification
supabase functions deploy send-reset-code
supabase functions deploy send-verification-code
supabase functions deploy verify-reset-code
supabase functions deploy translate-bulk
```

---

## Шаг 6: Обновление кода приложения

### 6.1 Обновите `.env` файл:
```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_ANON_KEY"
VITE_SUPABASE_PROJECT_ID="YOUR_PROJECT_REF"
```

### 6.2 Обновите URL изображений в базе данных

После миграции изображений в новый Storage bucket, обновите URL в таблицах:

```sql
-- Замените старый домен на новый
UPDATE cats SET image = REPLACE(image, 'rujvbcxpnzpikkmgdkfs', 'ВАШ_НОВЫЙ_PROJECT_REF');
UPDATE cats SET additional_images = (
  SELECT array_agg(REPLACE(img, 'rujvbcxpnzpikkmgdkfs', 'ВАШ_НОВЫЙ_PROJECT_REF'))
  FROM unnest(additional_images) AS img
);
UPDATE cat_pedigrees SET parent_images = (
  SELECT array_agg(REPLACE(img, 'rujvbcxpnzpikkmgdkfs', 'ВАШ_НОВЫЙ_PROJECT_REF'))
  FROM unnest(parent_images) AS img
);
```

---

## Шаг 7: Миграция Storage файлов

### Вариант 1: Через Supabase CLI
```bash
# Скачайте файлы из старого bucket
supabase storage cp -r storage://cat-images ./cat-images-backup --project-ref rujvbcxpnzpikkmgdkfs

# Загрузите в новый bucket
supabase storage cp -r ./cat-images-backup storage://cat-images --project-ref ВАШ_НОВЫЙ_PROJECT_REF
```

### Вариант 2: Вручную
1. Скачайте изображения по URL
2. Загрузите в новый bucket через Supabase Dashboard

---

## Шаг 8: Миграция пользователей

**Важно:** Пользователи не могут быть автоматически перенесены с паролями.

### Варианты:
1. **Пригласить заново** — пользователи регистрируются на новом проекте
2. **Использовать Magic Links** — отправить ссылки для входа без пароля
3. **Через Admin API** — создать пользователей программно (без паролей)

### Создание admin пользователя:
После первой регистрации, выполните:
```sql
-- Найдите ID вашего пользователя
SELECT id, email FROM auth.users WHERE email = 'ваш@email.com';

-- Назначьте роль admin
UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'ID_ПОЛЬЗОВАТЕЛЯ';
```

---

## Шаг 9: Настройка Auth

В Supabase Dashboard → Authentication → Settings:

1. **Site URL**: URL вашего приложения
2. **Redirect URLs**: Добавьте все домены приложения
3. **Email Templates**: Настройте шаблоны писем
4. **Disable email confirmations**: Для тестирования (опционально)

---

## Контрольный список

- [ ] Создан новый Supabase проект
- [ ] Выполнены все SQL миграции
- [ ] Импортированы данные котов и родословных
- [ ] Настроены секреты для Edge Functions
- [ ] Развернуты Edge Functions
- [ ] Обновлены переменные окружения в приложении
- [ ] Мигрированы файлы в Storage
- [ ] Создан admin пользователь
- [ ] Настроены параметры Auth
- [ ] Протестировано приложение

---

## Примечания

- **Переводы** содержат ~7900 записей — импорт может занять время
- **Изображения** нужно скачать и загрузить в новый bucket
- **Edge Functions** код уже есть в `supabase/functions/`
