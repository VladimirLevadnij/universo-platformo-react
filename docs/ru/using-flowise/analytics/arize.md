---
description: Узнайте, как настроить Arize для анализа и устранения неполадок ваших чат-потоков и агент-потоков
---

# Arize

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

[Arize AI](https://docs.arize.com/arize) - это платформа наблюдаемости производственного уровня для мониторинга, отладки и улучшения LLM приложений и ИИ агентов в масштабе. Для бесплатной альтернативы с открытым исходным кодом изучите [Phoenix](https://docs.flowiseai.com/using-flowise/analytics/phoenix).

## Настройка

1. В правом верхнем углу вашего чат-потока или агент-потока нажмите **Settings** > **Configuration**

<figure><img src="../../.gitbook/assets/analytic-1.webp" alt="Скриншот пользователя, нажимающего в меню конфигурации" width="375"><figcaption></figcaption></figure>

2. Затем перейдите в раздел Analyse Chatflow

<figure><img src="../../.gitbook/assets/analytic-2.png" alt="Скриншот раздела Analyse Chatflow с различными провайдерами аналитики"><figcaption></figcaption></figure>

3. Вы увидите список провайдеров вместе с их полями конфигурации. Нажмите на Arize.

<figure><img src="../../.gitbook/assets/arize/arize-1.png" alt="Скриншот провайдера аналитики с развернутыми полями учетных данных"><figcaption></figcaption></figure>

4. Создайте учетные данные для Arize. Обратитесь к [официальному руководству](https://docs.arize.com/arize/llm-tracing/quickstart-llm#get-your-api-keys) о том, как получить API ключ Arize.

<figure><img src="../../.gitbook/assets/arize/arize-2.png" alt="Скриншот включенных провайдеров аналитики"><figcaption></figcaption></figure>

5. Заполните другие детали конфигурации, затем включите провайдера **ON**

<figure><img src="../../.gitbook/assets/arize/arize-3.png" alt="Скриншот включенных провайдеров аналитики"><figcaption></figcaption></figure>
