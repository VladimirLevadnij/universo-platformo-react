# Устранение неполадок

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Этот раздел поможет вам диагностировать и решить наиболее распространенные проблемы при работе с Universo Platformo.

## Общие проблемы

### 1. Проблемы с установкой и запуском

#### Ошибка: "Cannot find module 'flowise'"

**Симптомы:**
```bash
Error: Cannot find module 'flowise'
```

**Решение:**
```bash
# Переустановите Flowise глобально
npm uninstall -g flowise
npm install -g flowise

# Или используйте npx для запуска
npx flowise start
```

#### Ошибка: "Port 3000 is already in use"

**Симптомы:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Решение:**
```bash
# Найдите процесс, использующий порт 3000
lsof -i :3000

# Завершите процесс (замените PID на фактический)
kill -9 <PID>

# Или используйте другой порт
PORT=3001 npx flowise start
```

#### Ошибка: "Permission denied"

**Симптомы:**
```bash
Error: EACCES: permission denied
```

**Решение:**
```bash
# Для Linux/Mac - используйте sudo (не рекомендуется)
sudo npm install -g flowise

# Лучше настроить npm для работы без sudo
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### 2. Проблемы с базой данных

#### Ошибка подключения к PostgreSQL

**Симптомы:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Решение:**
1. Проверьте, что PostgreSQL запущен:
```bash
# Linux/Mac
sudo systemctl status postgresql

# Windows
net start postgresql-x64-13
```

2. Проверьте параметры подключения в `.env`:
```bash
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=flowise
```

3. Создайте базу данных, если она не существует:
```sql
CREATE DATABASE flowise;
```

#### Ошибка: "relation does not exist"

**Симптомы:**
```
error: relation "canvas" does not exist
```

**Решение:**
```bash
# Удалите существующую базу данных и позвольте Flowise пересоздать её
DROP DATABASE flowise;
CREATE DATABASE flowise;

# Перезапустите Flowise
npx flowise start
```

### 3. Проблемы с API ключами

#### Ошибка: "Invalid API key"

**Симптомы:**
```
Error: Invalid API key provided
```

**Решение:**
1. Проверьте правильность API ключа
2. Убедитесь, что ключ активен и не истек
3. Проверьте лимиты использования API
4. Для OpenAI убедитесь, что у вас есть кредиты

#### Ошибка: "Rate limit exceeded"

**Симптомы:**
```
Error: Rate limit reached for requests
```

**Решение:**
1. Подождите перед следующим запросом
2. Увеличьте интервалы между запросами
3. Обновите план API для увеличения лимитов
4. Реализуйте retry логику с экспоненциальной задержкой

### 4. Проблемы с памятью и производительностью

#### Ошибка: "JavaScript heap out of memory"

**Симптомы:**
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Решение:**
```bash
# Увеличьте лимит памяти для Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npx flowise start

# Или установите переменную окружения постоянно
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

#### Медленная работа векторных баз данных

**Симптомы:**
- Долгое время ответа
- Таймауты при поиске

**Решение:**
1. Оптимизируйте размер индекса:
```javascript
// Уменьшите количество измерений
const embeddings = new OpenAIEmbeddings({
    dimensions: 512 // вместо 1536
});
```

2. Используйте фильтрацию по метаданным:
```javascript
const retriever = vectorStore.asRetriever({
    searchType: "similarity",
    searchKwargs: {
        k: 5,
        filter: { source: "specific_document" }
    }
});
```

3. Настройте индексы для часто используемых полей

### 5. Проблемы с Docker

#### Ошибка: "Container exits immediately"

**Симптомы:**
```bash
docker ps -a
# STATUS: Exited (1) 2 seconds ago
```

**Решение:**
```bash
# Проверьте логи контейнера
docker logs <container_id>

# Проверьте переменные окружения
docker run -it --rm flowise env

# Запустите в интерактивном режиме для отладки
docker run -it --rm flowise /bin/bash
```

#### Проблемы с томами Docker

**Симптомы:**
- Данные не сохраняются между перезапусками
- Ошибки доступа к файлам

**Решение:**
```bash
# Убедитесь, что том правильно примонтирован
docker run -d \
  -p 3000:3000 \
  -v ~/.flowise:/root/.flowise \
  --name flowise \
  flowiseai/flowise

# Проверьте права доступа
ls -la ~/.flowise
```

### 6. Проблемы с сетью и CORS

#### Ошибка CORS

**Симптомы:**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Решение:**
```bash
# Установите переменную окружения CORS_ORIGINS
export CORS_ORIGINS="http://localhost:3001,https://yourdomain.com"
npx flowise start
```

#### Проблемы с прокси

**Симптомы:**
- Не удается подключиться к внешним API
- Таймауты сетевых запросов

**Решение:**
```bash
# Настройте прокси для npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Установите переменные окружения для Node.js
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

## Диагностические инструменты

### 1. Проверка системы

```bash
# Проверьте версию Node.js
node --version

# Проверьте версию npm
npm --version

# Проверьте установленные пакеты
npm list -g --depth=0

# Проверьте доступные порты
netstat -tulpn | grep :3000
```

### 2. Проверка логов

```bash
# Включите подробное логирование
DEBUG=* npx flowise start

# Проверьте логи в файле
tail -f ~/.flowise/logs/server.log

# Фильтрация логов по уровню
grep "ERROR" ~/.flowise/logs/server.log
```

### 3. Проверка конфигурации

```bash
# Проверьте переменные окружения
env | grep FLOWISE

# Проверьте конфигурационный файл
cat ~/.flowise/.env

# Проверьте права доступа к файлам
ls -la ~/.flowise/
```

## Получение помощи

### 1. Сбор информации для отчета об ошибке

Перед обращением за помощью соберите следующую информацию:

```bash
# Системная информация
echo "OS: $(uname -a)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Flowise: $(npm list -g flowise --depth=0)"

# Логи ошибок
tail -n 50 ~/.flowise/logs/server-error.log

# Конфигурация (без паролей!)
env | grep FLOWISE | grep -v PASSWORD | grep -v SECRET
```

### 2. Создание минимального воспроизводимого примера

1. Создайте простейший чат-поток, который демонстрирует проблему
2. Экспортируйте конфигурацию чат-потока
3. Опишите шаги для воспроизведения проблемы
4. Укажите ожидаемое и фактическое поведение

### 3. Каналы поддержки

- **GitHub Issues**: Для багов и запросов функций
- **Discord**: Для быстрых вопросов и обсуждений
- **Документация**: Проверьте FAQ и руководства
- **Stack Overflow**: Для технических вопросов с тегом `flowise`

## Профилактические меры

### 1. Регулярное обслуживание

```bash
# Обновляйте Flowise регулярно
npm update -g flowise

# Очищайте кэш npm
npm cache clean --force

# Проверяйте целостность установки
npm doctor
```

### 2. Мониторинг системы

```bash
# Мониторинг использования ресурсов
htop

# Мониторинг дискового пространства
df -h

# Мониторинг логов в реальном времени
tail -f ~/.flowise/logs/server.log
```

### 3. Резервное копирование

```bash
# Создайте резервную копию конфигурации
cp -r ~/.flowise ~/.flowise.backup.$(date +%Y%m%d)

# Экспортируйте чат-потоки
# Используйте функцию экспорта в веб-интерфейсе

# Создайте дамп базы данных (для PostgreSQL)
pg_dump flowise > flowise_backup.sql
```

## Заключение

Большинство проблем с Universo Platformo можно решить, следуя этому руководству. Если проблема не решена:

1. Проверьте логи для получения дополнительной информации
2. Поищите похожие проблемы в GitHub Issues
3. Создайте детальный отчет об ошибке с воспроизводимым примером
4. Обратитесь к сообществу за помощью

Помните: хорошо описанная проблема - это половина решения!
