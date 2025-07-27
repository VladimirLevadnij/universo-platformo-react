# Начало работы

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

## Облачная версия

Самостоятельное развертывание требует больше технических навыков для настройки экземпляра, резервного копирования базы данных и поддержания обновлений. Если у вас нет опыта управления серверами и вы просто хотите использовать веб-приложение, мы рекомендуем использовать [Flowise Cloud](https://cloud.flowiseai.com).

## Быстрый старт

{% hint style="info" %}
Предварительное требование: убедитесь, что [NodeJS](https://nodejs.org/en/download) установлен на машине. Поддерживается Node `v18.15.0` или `v20` и выше.
{% endhint %}

Установите Flowise локально с помощью NPM.

1. Установите Flowise:

```bash
npm install -g flowise
```

Вы также можете установить конкретную версию. Обратитесь к доступным [версиям](https://www.npmjs.com/package/flowise?activeTab=versions).

```bash
npm install -g flowise@x.x.x
```

2. Запустите Flowise:

```bash
npx flowise start
```

3. Откройте: [http://localhost:3000](http://localhost:3000)

***

## Docker

Существует два способа развернуть Flowise с Docker. Сначала клонируйте проект: [https://github.com/FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise)

### Docker Compose

1. Перейдите в папку `docker` в корне проекта
2. Скопируйте файл `.env.example` и вставьте его как другой файл с именем `.env`
3. Выполните:

```bash
docker compose up -d
```

4. Откройте: [http://localhost:3000](http://localhost:3000)
5. Вы можете остановить контейнеры, выполнив:

```bash
docker compose stop
```

### Docker образ

1. Соберите образ:

```bash
docker build --no-cache -t flowise .
```

2. Запустите образ:

```bash
docker run -d --name flowise -p 3000:3000 flowise
```

3. Остановите образ:

```bash
docker stop flowise
```

***

## Для разработчиков

Flowise имеет 4 различных модуля в едином моно-репозитории:

* **Server**: Node бэкенд для обслуживания API логики
* **UI**: React фронтенд
* **Components**: Компоненты интеграции
* **Api Documentation**: Swagger спецификация для Flowise API

### Предварительные требования

Установите [PNPM](https://pnpm.io/installation).

```bash
npm i -g pnpm
```

### Настройка 1

Простая настройка с использованием PNPM:

1. Клонируйте репозиторий

```bash
git clone https://github.com/FlowiseAI/Flowise.git
```

2. Перейдите в папку репозитория

```bash
cd Flowise
```

3. Установите все зависимости всех модулей:

```bash
pnpm install
```

4. Соберите код:

```bash
pnpm build
```

Запустите приложение по адресу [http://localhost:3000](http://localhost:3000)

```bash
pnpm start
```

### Настройка 2

Пошаговая настройка для участников проекта:

1. Сделайте форк официального [репозитория Flowise на Github](https://github.com/FlowiseAI/Flowise)
2. Клонируйте ваш форкнутый репозиторий
3. Создайте новую ветку, см. [руководство](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository). Соглашения об именовании:
   * Для ветки функции: `feature/<Ваша новая функция>`
   * Для ветки исправления ошибки: `bugfix/<Ваше новое исправление>`.
4. Переключитесь на только что созданную ветку
5. Перейдите в папку репозитория:

```bash
cd Flowise
```

6. Установите все зависимости всех модулей:

```bash
pnpm install
```

7. Соберите код:

```bash
pnpm build
```

8. Запустите приложение по адресу [http://localhost:3000](http://localhost:3000)

```bash
pnpm start
```

9. Для сборки разработки:

* Создайте файл `.env` и укажите `PORT` (обратитесь к `.env.example`) в `packages/ui`
* Создайте файл `.env` и укажите `PORT` (обратитесь к `.env.example`) в `packages/server`

```bash
pnpm dev
```

* Любые изменения, внесенные в `packages/ui` или `packages/server`, будут отражены по адресу [http://localhost:8080](http://localhost:8080/)
* Для изменений, внесенных в `packages/components`, вам нужно будет собрать снова, чтобы подхватить изменения
* После внесения всех изменений выполните:

    ```bash
    pnpm build
    ```

    и

    ```bash
    pnpm start
    ```

    чтобы убедиться, что все работает нормально в продакшене.

***

## Для предприятий

Перед запуском приложения корпоративные пользователи должны заполнить значения для корпоративных параметров в файле `.env`. Обратитесь к `.env.example` для необходимых изменений.

Обратитесь к support@flowiseai.com за значением следующих переменных окружения:

```
LICENSE_URL
FLOWISE_EE_LICENSE_KEY
```

***

## Узнать больше

В этом видео-уроке Леон представляет введение в Flowise и объясняет, как настроить его на вашей локальной машине.

{% embed url="https://youtu.be/nqAK_L66sIQ" %}

## Руководство сообщества

* [Введение в [Практическое] создание LLM приложений с Flowise / LangChain](https://volcano-ice-cd6.notion.site/Introduction-to-Practical-Building-LLM-Applications-with-Flowise-LangChain-03d6d75bfd20495d96dfdae964bea5a5)
* [Flowise / LangChainによるLLMアプリケーション構築\[実践\]入門](https://volcano-ice-cd6.notion.site/Flowise-LangChain-LLM-e106bb0f7e2241379aad8fa428ee064a)
