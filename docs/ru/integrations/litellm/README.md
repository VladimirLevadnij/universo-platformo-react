---
description: Изучите, как Flowise интегрируется с LiteLLM Proxy
---

# LiteLLM Proxy

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Используйте [LiteLLM Proxy](https://docs.litellm.ai/docs/simple_proxy) с Flowise для:

- Балансировки нагрузки конечных точек Azure OpenAI/LLM
- Вызова 100+ LLM в формате OpenAI 
- Использования виртуальных ключей для установки бюджетов, ограничений скорости и отслеживания использования

## Как использовать LiteLLM Proxy с Flowise

### Шаг 1: Определите ваши LLM модели в файле конфигурации LiteLLM config.yaml

LiteLLM требует конфигурацию со всеми вашими определенными моделями - мы назовем этот файл `litellm_config.yaml`

[Подробная документация о том, как настроить конфигурацию litellm - здесь](https://docs.litellm.ai/docs/proxy/configs)

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: 
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4
      api_key: 
      api_base: https://openai-gpt-4-test-v-2.openai.azure.com/
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4
      api_key: 
      api_base: https://openai-gpt-4-test-v-2.openai.azure.com/
```


### Шаг 2. Запустите litellm proxy

```shell
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -p 4000:4000 \
    ghcr.io/berriai/litellm:main-latest \
    --config /app/config.yaml --detailed_debug
```

При успехе прокси начнет работать на `http://localhost:4000/`

### Шаг 3: Используйте LiteLLM Proxy в Flowise

В Flowise укажите **стандартные узлы OpenAI (не узлы Azure OpenAI)** -- это касается **чат-моделей, эмбеддингов, llm -- всего**

- Установите `BasePath` на URL LiteLLM Proxy (`http://localhost:4000` при локальном запуске)
- Установите следующие заголовки `Authorization: Bearer <your-litellm-master-key>`
