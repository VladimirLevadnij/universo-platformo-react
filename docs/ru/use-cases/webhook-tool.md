---
description: Изучите, как вызвать webhook на Make
---

# Вызов Webhook

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Это руководство проведет вас через создание пользовательского инструмента в FlowiseAI, который вызывает конечную точку webhook, передавая необходимые параметры в теле запроса. Мы будем использовать [Make.com](https://www.make.com/en) для настройки рабочего процесса webhook, который отправляет сообщения в канал Discord.

## Настройка Webhook в Make.com

1. Зарегистрируйтесь или войдите в [Make.com](https://www.make.com/en).
2. Создайте новый рабочий процесс, содержащий модуль **Webhook** и модуль **Discord**, как показано ниже:

   <figure><img src="../.gitbook/assets/screely-1691756705932.png" alt="Пример рабочего процесса"><figcaption></figcaption></figure>

3. Из модуля **Webhook** скопируйте URL webhook:

   <figure><img src="../.gitbook/assets/image (46).png" alt="URL Webhook" width="563"><figcaption></figcaption></figure>

4. В модуле **Discord** настройте его для передачи `message` из тела webhook как сообщения, отправляемого в канал Discord:

   <figure><img src="../.gitbook/assets/image (47).png" alt="Настройка модуля Discord" width="563"><figcaption></figcaption></figure>

5. Нажмите **Запустить один раз** для начала прослушивания входящих запросов.
6. Отправьте тестовый POST запрос со следующим JSON телом:

   ```json
   {
       "message": "Привет Discord!"
   }
   ```

   <figure><img src="../.gitbook/assets/image (48).png" alt="Отправка POST запроса" width="563"><figcaption></figcaption></figure>

7. Если успешно, вы увидите сообщение в вашем канале Discord:

   <figure><img src="../.gitbook/assets/image (49).png" alt="Сообщение Discord" width="249"><figcaption></figcaption></figure>

Поздравляем! Вы успешно настроили рабочий процесс webhook, который отправляет сообщения в Discord. 🎉

## Создание инструмента Webhook в FlowiseAI

Далее мы создадим пользовательский инструмент в FlowiseAI для отправки webhook запросов.

### Шаг 1: Добавить новый инструмент

1. Откройте панель управления **FlowiseAI**.
2. Нажмите **Инструменты**, затем выберите **Создать**.

   <figure><img src="../.gitbook/assets/screely-1691758397783.png" alt="Создание инструмента в FlowiseAI"><figcaption></figcaption></figure>

3. Заполните следующие поля:

   | Поле | Значение |
   |-------|-------|
   | **Название инструмента** | `make_webhook` (должно быть в snake_case) |
   | **Описание инструмента** | Полезно, когда вам нужно отправлять сообщения в Discord |
   | **Источник иконки инструмента** | [Иконка инструмента Flowise](https://github.com/FlowiseAI/Flowise/assets/26460777/517fdab2-8a6e-4781-b3c8-fb92cc78aa0b) |

4. Определите **Входную схему**:

   <figure><img src="../.gitbook/assets/image (167).png" alt="Пример входной схемы"><figcaption></figcaption></figure>

### Шаг 2: Добавить логику запроса Webhook

Введите следующую JavaScript функцию:

```javascript
const fetch = require('node-fetch');
const webhookUrl = 'https://hook.eu1.make.com/abcdef';
const body = {
    "message": $message
};
const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
};
try {
    const response = await fetch(webhookUrl, options);
    const text = await response.text();
    return text;
} catch (error) {
    console.error(error);
    return '';
}
```

5. Нажмите **Добавить** для сохранения вашего пользовательского инструмента.

   <figure><img src="../.gitbook/assets/image (51).png" alt="Подтверждение добавления инструмента" width="279"><figcaption></figcaption></figure>

### Шаг 3: Создать Canvas с интеграцией Webhook

1. Создайте новый холст и добавьте следующие узлы:
   - **Buffer Memory**
   - **ChatOpenAI**
   - **Custom Tool** (выберите `make_webhook`)
   - **OpenAI Function Agent**

2. Соедините их как показано:

   <figure><img src="../.gitbook/assets/screely-1691758990676.png" alt="Настройка Canvas"><figcaption></figcaption></figure>

3. Сохраните canvas и начните его тестирование.

### Шаг 4: Отправка сообщений через Webhook

Попробуйте задать чат-боту вопрос типа:

> _"Как приготовить яйцо?"_

Затем попросите агента отправить эту информацию в Discord:

   <figure><img src="../.gitbook/assets/image (53).png" alt="Отправка сообщения через агента" width="563"><figcaption></figcaption></figure>

Вы должны увидеть сообщение в вашем канале Discord:

   <figure><img src="../.gitbook/assets/image (54).png" alt="Финальное сообщение в Discord"><figcaption></figcaption></figure>

### Альтернативные инструменты тестирования Webhook

Если вы хотите тестировать webhooks без Make.com, рассмотрите использование:

- [Beeceptor](https://beeceptor.com) – Быстро настройте mock API конечную точку.
- [Webhook.site](https://webhook.site) – Инспектируйте и отлаживайте HTTP запросы в реальном времени.
- [Pipedream RequestBin](https://pipedream.com/requestbin) – Захватывайте и анализируйте входящие webhooks.

## Больше руководств

- Посмотрите пошаговое руководство по использованию webhooks с пользовательскими инструментами Flowise:
  {% embed url="https://youtu.be/_K9xJqEgnrU" %}

- Изучите, как подключить Flowise к Google Sheets с использованием webhooks:
  {% embed url="https://youtu.be/fehXLdRLJFo" %}

- Изучите, как подключить Flowise к Microsoft Excel с использованием webhooks:
  {% embed url="https://youtu.be/cB2GC8JznJc" %}

Следуя этому руководству, вы можете динамически запускать рабочие процессы webhook и расширять автоматизацию на различные сервисы, такие как Gmail, Google Sheets и многое другое.
