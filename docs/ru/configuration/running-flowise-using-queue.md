# Запуск Flowise с использованием очереди

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

По умолчанию Flowise работает в основном потоке NodeJS. Однако при большом количестве предсказаний это плохо масштабируется. Поэтому есть 2 режима, которые вы можете настроить: `main` (по умолчанию) и `queue`.

## Режим очереди

С помощью следующих переменных окружения вы можете запустить Flowise в режиме `queue`.

<table><thead><tr><th width="263">Переменная</th><th>Описание</th><th>Тип</th><th>По умолчанию</th></tr></thead><tbody><tr><td>MODE</td><td>Режим запуска Flowise</td><td>Enum String: <code>main</code>, <code>queue</code></td><td><code>main</code></td></tr><tr><td>WORKER_CONCURRENCY</td><td>Сколько заданий разрешено обрабатывать параллельно для воркера. Если у вас 1 воркер, это означает, сколько одновременных задач предсказания он может обрабатывать. Больше <a href="https://docs.bullmq.io/guide/workers/concurrency">информации</a></td><td>Number</td><td>10000</td></tr><tr><td>QUEUE_NAME</td><td>Имя очереди сообщений</td><td>String</td><td>flowise-queue</td></tr><tr><td>QUEUE_REDIS_EVENT_STREAM_MAX_LEN</td><td>Поток событий автоматически обрезается, чтобы его размер не рос слишком сильно. Больше <a href="https://docs.bullmq.io/guide/events">информации</a></td><td>Number</td><td>10000</td></tr><tr><td>REDIS_URL</td><td>Redis URL</td><td>String</td><td></td></tr><tr><td>REDIS_HOST</td><td>Redis хост</td><td>String</td><td>localhost</td></tr><tr><td>REDIS_PORT</td><td>Redis порт</td><td>Number</td><td>6379</td></tr><tr><td>REDIS_USERNAME</td><td>Redis имя пользователя (опционально)</td><td>String</td><td></td></tr><tr><td>REDIS_PASSWORD</td><td>Redis пароль (опционально)</td><td>String</td><td></td></tr><tr><td>REDIS_TLS</td><td>Redis TLS соединение (опционально) Больше <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/">информации</a></td><td>Boolean</td><td>false</td></tr><tr><td>REDIS_CERT</td><td>Redis самоподписанный сертификат</td><td>String</td><td></td></tr><tr><td>REDIS_KEY</td><td>Файл ключа самоподписанного сертификата Redis</td><td>String</td><td></td></tr><tr><td>REDIS_CA</td><td>Файл CA самоподписанного сертификата Redis</td><td>String</td><td></td></tr></tbody></table>

В режиме `queue` основной сервер будет отвечать за обработку запросов, отправляя задания в очередь сообщений. Основной сервер не будет выполнять задание. Один или несколько воркеров получают задания из очереди, выполняют их и отправляют результаты обратно.

Это позволяет динамическое масштабирование: вы можете добавлять воркеров для обработки увеличенных рабочих нагрузок или удалять их в периоды меньшей нагрузки.

Вот как это работает:

1. Основной сервер получает предсказания или другие запросы из веба, добавляя их как задания в очередь.
2. Эти очереди заданий являются по сути списками задач, ожидающих обработки. Воркеры, которые являются по сути отдельными процессами или потоками, берут эти задания и выполняют их.
3. После завершения задания воркер:
   * Записывает результаты в базу данных.
   * Отправляет событие для указания завершения задания.
4. Основной сервер получает событие и отправляет результат обратно в пользовательский интерфейс.
5. Redis pub/sub также используется для потоковой передачи данных обратно в пользовательский интерфейс.

<figure><img src="../.gitbook/assets/Untitled-2025-01-23-1520.png" alt=""><figcaption></figcaption></figure>

## Локальная настройка

### Запуск Redis

Перед запуском основного сервера и воркеров Redis должен быть запущен первым. Вы можете запустить Redis на отдельной машине, но убедитесь, что он доступен для экземпляров сервера и воркера.

Например, вы можете запустить Redis в вашем Docker, следуя этому [руководству](https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/).

### Запуск основного сервера

Это то же самое, что и запуск Flowise по умолчанию, за исключением настройки переменных окружения, упомянутых выше.

```bash
pnpm start
```

### Запуск воркера

Как и для основного сервера, переменные окружения выше должны быть настроены. Мы рекомендуем просто использовать тот же файл `.env` для экземпляров основного сервера и воркера. Единственное отличие - как запускать воркеров. Откройте другой терминал и запустите:

```bash
pnpm run start-worker
```

{% hint style="warning" %}
Основной сервер и воркер должны использовать один и тот же секретный ключ. Обратитесь к [#for-credentials](environment-variables.md#for-credentials "mention"). Для продакшена мы рекомендуем использовать Postgres в качестве базы данных для производительности.
{% endhint %}

## Настройка Docker

### Метод 1: Предварительно собранные образы (Рекомендуется)

Этот метод использует предварительно собранные Docker образы из Docker Hub, что делает его самым быстрым и надежным вариантом развертывания.

**Шаг 1: Настройка окружения**

Создайте файл `.env` в директории `docker`:

```bash
# Базовая конфигурация
PORT=3000
WORKER_PORT=5566

# Конфигурация очереди (Обязательно)
MODE=queue
QUEUE_NAME=flowise-queue
REDIS_URL=redis://redis:6379

# Опциональные настройки очереди
WORKER_CONCURRENCY=5
REMOVE_ON_AGE=24
REMOVE_ON_COUNT=1000
QUEUE_REDIS_EVENT_STREAM_MAX_LEN=1000
ENABLE_BULLMQ_DASHBOARD=false

# База данных (Опционально - по умолчанию SQLite)
DATABASE_PATH=/root/.flowise

# Хранилище
BLOB_STORAGE_PATH=/root/.flowise/storage

# Секретные ключи
SECRETKEY_PATH=/root/.flowise

# Логирование
LOG_PATH=/root/.flowise/logs
```

**Шаг 2: Развертывание**

```bash
cd docker
docker compose -f docker-compose-queue-prebuilt.yml up -d
```

**Шаг 3: Проверка развертывания**

```bash
# Проверка статуса контейнеров
docker compose -f docker-compose-queue-prebuilt.yml ps

# Просмотр логов
docker compose -f docker-compose-queue-prebuilt.yml logs -f flowise
docker compose -f docker-compose-queue-prebuilt.yml logs -f flowise-worker
```

### Метод 2: Сборка из исходного кода

Этот метод собирает Flowise из исходного кода, полезен для разработки или пользовательских модификаций.

**Шаг 1: Настройка окружения**

Создайте тот же файл `.env`, как в [Методе 1](running-flowise-using-queue.md#method-1-pre-built-images-recommended).

**Шаг 2: Развертывание**

```bash
cd docker
docker compose -f docker-compose-queue-source.yml up -d
```

**Шаг 3: Процесс сборки**

Сборка из исходного кода будет:

* Собирать основное приложение Flowise из исходного кода
* Собирать образ воркера из исходного кода
* Настраивать Redis и сеть

**Шаг 4: Мониторинг сборки**

```bash
# Наблюдение за прогрессом сборки
docker compose -f docker-compose-queue-source.yml logs -f

# Проверка финального статуса
docker compose -f docker-compose-queue-source.yml ps
```

### Проверки состояния

Все compose файлы включают проверки состояния:

```bash
# Проверка состояния основного экземпляра
curl http://localhost:3000/api/v1/ping

# Проверка состояния воркера
curl http://localhost:5566/healthz
```

## Панель управления очередью

Установка `ENABLE_BULLMQ_DASHBOARD` в true позволит пользователям просматривать все задания, статус, результат, данные, перейдя по адресу `<your-flowise-url.com>/admin/queues`

<figure><img src="../.gitbook/assets/image (253).png" alt=""><figcaption></figcaption></figure>
