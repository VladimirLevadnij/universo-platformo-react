---
description: Узнайте, как анализировать и устранять неполадки ваших чат-потоков и агент-потоков
---

# Аналитика

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Flowise предоставляет пошаговое отслеживание для [Agentflow V2](../agentflowv2.md):

<figure><img src="../../.gitbook/assets/image (332).png" alt=""><figcaption></figcaption></figure>

Кроме того, есть также несколько провайдеров аналитики, с которыми интегрируется Flowise:

* [LunaryAI](https://lunary.ai/)
* [Langsmith](https://smith.langchain.com/)
* [Langfuse](https://langfuse.com/)
* [LangWatch](https://langwatch.ai/)
* [Arize](https://arize.com/)
* [Phoenix](https://phoenix.arize.com/)
* [Opik](https://www.comet.com/site/products/opik/)

## Настройка

1. В правом верхнем углу вашего чат-потока или агент-потока нажмите **Settings** > **Configuration**

<figure><img src="../../.gitbook/assets/analytic-1.webp" alt="Скриншот пользователя, нажимающего в меню конфигурации" width="375"><figcaption></figcaption></figure>

2. Затем перейдите в раздел Analyse Chatflow

<figure><img src="../../.gitbook/assets/analytic-2.png" alt="Скриншот раздела Analyse Chatflow с различными провайдерами аналитики"><figcaption></figcaption></figure>

3. Вы увидите список провайдеров вместе с их полями конфигурации

<figure><img src="../../.gitbook/assets/image (82).png" alt="Скриншот провайдера аналитики с развернутыми полями учетных данных"><figcaption></figcaption></figure>

4. Заполните учетные данные и другие детали конфигурации, затем включите провайдера **ON**. Нажмите Save.

<figure><img src="../../.gitbook/assets/image (83).png" alt="Скриншот включенных провайдеров аналитики"><figcaption></figcaption></figure>

## API

После того как аналитика была включена **ON** из пользовательского интерфейса, вы можете переопределить или предоставить дополнительную конфигурацию в теле [Prediction API](api.md#prediction-api):

```json
{
  "question": "привет",
  "overrideConfig": {
    "analytics": {
      "langFuse": {
        // langSmith, langFuse, lunary, langWatch, opik
        "userId": "user1"
      }
    }
  }
}
```
