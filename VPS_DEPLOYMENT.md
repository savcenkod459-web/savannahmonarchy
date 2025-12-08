# Развёртывание SavannahDynasty на Hostinger VPS

## Содержание
1. [Требования](#требования)
2. [Подготовка VPS](#подготовка-vps)
3. [Установка Node.js и зависимостей](#установка-nodejs-и-зависимостей)
4. [Сборка проекта](#сборка-проекта)
5. [Настройка Nginx](#настройка-nginx)
6. [SSL-сертификат (Let's Encrypt)](#ssl-сертификат-lets-encrypt)
7. [Автоматические обновления (CI/CD)](#автоматические-обновления-cicd)
8. [Мониторинг и обслуживание](#мониторинг-и-обслуживание)

---

## Требования

- **VPS**: Ubuntu 22.04 LTS (рекомендуется)
- **RAM**: минимум 1 GB
- **Диск**: минимум 10 GB SSD
- **Домен**: привязанный к IP VPS
- **SSH доступ**: к серверу

---

## Подготовка VPS

### 1. Подключение к серверу

```bash
ssh root@ваш_ip_адрес
```

### 2. Обновление системы

```bash
apt update && apt upgrade -y
```

### 3. Создание пользователя (рекомендуется)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### 4. Настройка файрвола

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Установка Node.js и зависимостей

### 1. Установка Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Проверка установки

```bash
node -v  # должно показать v20.x.x
npm -v   # должно показать 10.x.x
```

### 3. Установка Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Установка Git

```bash
sudo apt install git -y
```

---

## Сборка проекта

### 1. Клонирование репозитория

```bash
cd /home/deploy
git clone https://github.com/ВАШ_РЕПОЗИТОРИЙ/savannah-dynasty.git
cd savannah-dynasty
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Создание файла окружения

Создайте файл `.env` в корне проекта:

```bash
nano .env
```

Добавьте переменные окружения:

```env
VITE_SUPABASE_URL=https://rujvbcxpnzpikkmgdkfs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1anZiY3hwbnpwaWtrbWdka2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMTc2NzUsImV4cCI6MjA3NTU5MzY3NX0.hD3auiGF0hLclhggC_43AvtKS1TxhQTeekBoHO9sxmM
VITE_SUPABASE_PROJECT_ID=rujvbcxpnzpikkmgdkfs
```

### 4. Сборка для production

```bash
npm run build
```

Это создаст папку `dist/` со всеми статическими файлами.

### 5. Копирование в директорию веб-сервера

```bash
sudo mkdir -p /var/www/savannahdynasty
sudo cp -r dist/* /var/www/savannahdynasty/
sudo chown -R www-data:www-data /var/www/savannahdynasty
```

---

## Настройка Nginx

### 1. Создание конфигурации сайта

```bash
sudo nano /etc/nginx/sites-available/savannahdynasty
```

### 2. Добавьте конфигурацию

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ваш-домен.com www.ваш-домен.com;
    
    root /var/www/savannahdynasty;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Кеширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Кеширование видео
    location ~* \.(mp4|webm|ogg)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # SPA routing - все запросы направляем на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Запрет доступа к скрытым файлам
    location ~ /\. {
        deny all;
    }
}
```

### 3. Активация сайта

```bash
sudo ln -s /etc/nginx/sites-available/savannahdynasty /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # удаляем дефолтный сайт
```

### 4. Проверка конфигурации и перезапуск

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL-сертификат (Let's Encrypt)

### 1. Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Получение сертификата

```bash
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com
```

Следуйте инструкциям:
- Введите email для уведомлений
- Согласитесь с условиями (Y)
- Выберите redirect HTTP → HTTPS (рекомендуется)

### 3. Автоматическое обновление сертификата

Certbot автоматически настраивает cron-задачу. Проверьте:

```bash
sudo certbot renew --dry-run
```

### 4. Финальная конфигурация Nginx (после SSL)

Certbot автоматически обновит конфигурацию. Она будет выглядеть примерно так:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ваш-домен.com www.ваш-домен.com;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/savannahdynasty;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Кеширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

---

## Автоматические обновления (CI/CD)

### Вариант 1: Простой скрипт обновления

Создайте скрипт на сервере:

```bash
nano /home/deploy/update-site.sh
```

```bash
#!/bin/bash
set -e

cd /home/deploy/savannah-dynasty

echo "📥 Получение обновлений..."
git pull origin main

echo "📦 Установка зависимостей..."
npm install

echo "🔨 Сборка проекта..."
npm run build

echo "📂 Копирование файлов..."
sudo cp -r dist/* /var/www/savannahdynasty/
sudo chown -R www-data:www-data /var/www/savannahdynasty

echo "✅ Обновление завершено!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /home/deploy/update-site.sh
```

Запуск обновления:

```bash
./update-site.sh
```

### Вариант 2: GitHub Actions (Автоматический деплой)

Создайте файл `.github/workflows/deploy.yml` в репозитории:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}

      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/savannahdynasty"
          strip_components: 1

      - name: Set permissions
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            sudo chown -R www-data:www-data /var/www/savannahdynasty
```

#### Настройка секретов в GitHub:

1. Перейдите в репозиторий → Settings → Secrets and variables → Actions
2. Добавьте секреты:
   - `VPS_HOST` - IP адрес вашего VPS
   - `VPS_USER` - пользователь (например, `deploy`)
   - `VPS_SSH_KEY` - приватный SSH ключ
   - `VITE_SUPABASE_URL` - URL Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - публичный ключ
   - `VITE_SUPABASE_PROJECT_ID` - ID проекта

#### Генерация SSH ключа для деплоя:

```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# Копируем публичный ключ на сервер
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@ваш_ip

# Содержимое ~/.ssh/github_deploy (приватный ключ) добавляем в GitHub Secrets
```

### Вариант 3: Webhook (Мгновенный деплой)

Установите webhook-сервер:

```bash
sudo apt install webhook -y
```

Создайте конфигурацию:

```bash
sudo nano /etc/webhook.conf
```

```json
[
  {
    "id": "deploy-site",
    "execute-command": "/home/deploy/update-site.sh",
    "command-working-directory": "/home/deploy",
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "ваш_секретный_ключ",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

Настройте webhook в GitHub репозитории:
- URL: `https://ваш-домен.com:9000/hooks/deploy-site`
- Secret: тот же секретный ключ

---

## Мониторинг и обслуживание

### Проверка статуса Nginx

```bash
sudo systemctl status nginx
```

### Просмотр логов

```bash
# Логи доступа
sudo tail -f /var/log/nginx/access.log

# Логи ошибок
sudo tail -f /var/log/nginx/error.log
```

### Мониторинг ресурсов

```bash
# Использование диска
df -h

# Использование памяти
free -m

# Процессы
htop
```

### Полезные команды

```bash
# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка конфигурации Nginx
sudo nginx -t

# Обновление сертификата вручную
sudo certbot renew

# Очистка кеша npm
npm cache clean --force
```

---

## Чеклист перед запуском

- [ ] VPS настроен и обновлён
- [ ] Node.js 20.x установлен
- [ ] Nginx установлен и настроен
- [ ] Проект склонирован и собран
- [ ] SSL сертификат получен
- [ ] Домен привязан к IP сервера
- [ ] Файрвол настроен
- [ ] CI/CD настроен (опционально)
- [ ] Бекапы настроены (опционально)

---

## Важные замечания

1. **База данных**: Вся база данных остаётся в Lovable Cloud. Ничего не нужно переносить.

2. **Edge Functions**: Все серверные функции (отправка email, сброс пароля и т.д.) работают в Lovable Cloud.

3. **Storage**: Все изображения хранятся в Lovable Cloud Storage.

4. **Обновления кода**: После изменений в Lovable нужно пересобрать и задеплоить:
   ```bash
   ./update-site.sh
   ```

5. **DNS**: Убедитесь, что A-запись домена указывает на IP вашего VPS.

---

## Решение проблем

### Сайт не открывается
```bash
# Проверьте статус Nginx
sudo systemctl status nginx

# Проверьте порты
sudo netstat -tlnp | grep nginx

# Проверьте файрвол
sudo ufw status
```

### 502 Bad Gateway
```bash
# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

### SSL не работает
```bash
# Проверьте сертификат
sudo certbot certificates

# Обновите сертификат
sudo certbot renew --force-renewal
```

---

## Поддержка

При возникновении проблем:
1. Проверьте логи Nginx
2. Убедитесь, что все переменные окружения установлены
3. Проверьте подключение к Lovable Cloud (откройте dev tools → Network)
