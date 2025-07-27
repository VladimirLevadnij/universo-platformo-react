---
description: Узлы эмбеддингов LangChain
---

# Эмбеддинги

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Эмбеддинг - это вектор (список) чисел с плавающей точкой. Расстояние между двумя векторами измеряет их связанность. Малые расстояния указывают на высокую связанность, а большие расстояния - на низкую связанность.

Эмбеддинги могут использоваться для создания численного представления текстовых данных. Это численное представление полезно, поскольку его можно использовать для поиска похожих документов.

Они обычно используются для:

* Поиска (где результаты ранжируются по релевантности к поисковому запросу)
* Кластеризации (где текстовые строки группируются по сходству)
* Рекомендаций (где рекомендуются элементы со связанными текстовыми строками)
* Обнаружения аномалий (где выявляются выбросы с малой связанностью)
* Измерения разнообразия (где анализируются распределения сходства)
* Классификации (где текстовые строки классифицируются по их наиболее похожей метке)

### Узлы эмбеддингов:

* [AWS Bedrock Embeddings](aws-bedrock-embeddings.md)
* [Azure OpenAI Embeddings](azure-openai-embeddings.md)
* [Cohere Embeddings](cohere-embeddings.md)
* [Google GenerativeAI Embeddings](googlegenerativeai-embeddings.md)
* [Google PaLM Embeddings](broken-reference)
* [Google VertexAI Embeddings](googlevertexai-embeddings.md)
* [HuggingFace Inference Embeddings](huggingface-inference-embeddings.md)
* [LocalAI Embeddings](localai-embeddings.md)
* [MistralAI Embeddings](mistralai-embeddings.md)
* [Ollama Embeddings](ollama-embeddings.md)
* [OpenAI Embeddings](openai-embeddings.md)
* [OpenAI Embeddings Custom](openai-embeddings-custom.md)
* [TogetherAI Embedding](togetherai-embedding.md)
* [VoyageAI Embeddings](voyageai-embeddings.md)
