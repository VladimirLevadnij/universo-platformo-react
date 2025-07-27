---
description: Узлы векторных хранилищ LangChain
---

# Векторные хранилища

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Векторное хранилище или векторная база данных относится к типу системы баз данных, которая специализируется на хранении и извлечении многомерных числовых векторов. Векторные хранилища предназначены для эффективного управления и индексации этих векторов, обеспечивая быстрый поиск по сходству.

## Что такое векторные хранилища?

Векторные хранилища - это специализированные базы данных, оптимизированные для работы с векторными представлениями данных. Они играют ключевую роль в современных AI-приложениях, особенно в:

- **Поиске по сходству** - нахождение похожих документов, изображений или других данных
- **Рекомендательных системах** - предложение релевантного контента
- **RAG системах** - извлечение контекста для генерации ответов
- **Семантическом поиске** - поиск по смыслу, а не по ключевым словам

### Посмотрите введение в векторные хранилища и как их использовать в Flowise

{% embed url="https://youtu.be/m0nr1_pnAxc" %}

## Принципы работы векторных хранилищ

### 1. Векторизация данных

```python
# Пример процесса векторизации
text = "Искусственный интеллект революционизирует технологии"
embedding_model = OpenAIEmbeddings()
vector = embedding_model.embed_query(text)
# Результат: [0.1, -0.3, 0.7, ..., 0.2] (1536 измерений для OpenAI)
```

### 2. Индексирование

Векторные хранилища используют специальные алгоритмы индексирования:

- **HNSW (Hierarchical Navigable Small World)** - быстрый приближенный поиск
- **IVF (Inverted File)** - разделение пространства на кластеры
- **LSH (Locality Sensitive Hashing)** - хеширование для быстрого поиска
- **Annoy** - деревья случайных проекций

### 3. Поиск по сходству

```python
# Метрики сходства
similarity_metrics = {
    "cosine": "Косинусное сходство (угол между векторами)",
    "euclidean": "Евклидово расстояние (прямая линия)",
    "dot_product": "Скалярное произведение",
    "manhattan": "Манхэттенское расстояние"
}
```

## Типы векторных хранилищ

### 1. Облачные решения
- **Pinecone** - управляемый сервис с высокой производительностью
- **Weaviate Cloud** - GraphQL API с семантическим поиском
- **Qdrant Cloud** - высокопроизводительное векторное хранилище
- **Chroma Cloud** - простое в использовании решение

### 2. Self-hosted решения
- **Milvus** - масштабируемая векторная база данных
- **Qdrant** - быстрое и точное векторное хранилище
- **Weaviate** - векторная база данных с GraphQL
- **Chroma** - легковесное векторное хранилище

### 3. Интегрированные решения
- **PostgreSQL + pgvector** - расширение для PostgreSQL
- **Elasticsearch** - полнотекстовый поиск + векторы
- **Redis** - в памяти с векторным поиском
- **MongoDB Atlas** - документная БД с векторным поиском

### 4. Специализированные решения
- **FAISS** - библиотека Facebook для поиска сходства
- **Annoy** - приближенный поиск ближайших соседей
- **In-Memory** - временное хранилище в памяти

## Выбор векторного хранилища

### Критерии выбора

```yaml
# Матрица выбора векторного хранилища
performance:
  latency: "< 100ms для real-time приложений"
  throughput: "> 1000 QPS для высоконагруженных систем"
  accuracy: "> 95% для критически важных приложений"

scalability:
  data_size: "Миллионы/миллиарды векторов"
  concurrent_users: "Тысячи одновременных пользователей"
  horizontal_scaling: "Автоматическое масштабирование"

features:
  metadata_filtering: "Фильтрация по атрибутам"
  hybrid_search: "Комбинация векторного и текстового поиска"
  real_time_updates: "Обновления в реальном времени"
  multi_tenancy: "Изоляция данных клиентов"

operational:
  managed_service: "Облачное управление vs self-hosted"
  backup_recovery: "Резервное копирование и восстановление"
  monitoring: "Метрики и алерты"
  cost: "Стоимость хранения и операций"
```

### Рекомендации по использованию

#### Для начинающих проектов:
```python
# Простое решение для прототипирования
vector_store = Chroma(
    persist_directory="./chroma_db",
    embedding_function=OpenAIEmbeddings()
)
```

#### Для продакшен систем:
```python
# Масштабируемое решение
vector_store = Pinecone(
    index_name="production-index",
    environment="us-west1-gcp",
    embedding_function=OpenAIEmbeddings()
)
```

#### Для enterprise решений:
```python
# Самостоятельно управляемое решение
vector_store = Milvus(
    host="milvus-cluster.company.com",
    port=19530,
    collection_name="enterprise_docs",
    embedding_function=OpenAIEmbeddings()
)
```

## Лучшие практики

### 1. Оптимизация эмбеддингов

```python
# Выбор подходящей модели эмбеддингов
embedding_models = {
    "openai_ada_002": {
        "dimensions": 1536,
        "use_case": "Универсальное использование",
        "cost": "Средняя",
        "quality": "Высокая"
    },
    "sentence_transformers": {
        "dimensions": 384-768,
        "use_case": "Локальное развертывание",
        "cost": "Бесплатно",
        "quality": "Хорошая"
    },
    "cohere_embed": {
        "dimensions": 4096,
        "use_case": "Многоязычность",
        "cost": "Низкая",
        "quality": "Высокая"
    }
}
```

### 2. Индексирование и производительность

```python
# Настройки индекса для оптимальной производительности
index_config = {
    "metric_type": "COSINE",  # Метрика сходства
    "index_type": "HNSW",     # Тип индекса
    "params": {
        "M": 16,              # Количество соединений
        "efConstruction": 200, # Размер динамического списка
        "ef": 100             # Размер поиска
    }
}
```

### 3. Управление метаданными

```python
# Структурирование метаданных для эффективной фильтрации
metadata_schema = {
    "document_id": "string",
    "source": "string",
    "category": "string", 
    "timestamp": "datetime",
    "author": "string",
    "language": "string",
    "confidence_score": "float"
}

# Пример добавления документа с метаданными
vector_store.add_documents([
    Document(
        page_content="Содержимое документа",
        metadata={
            "source": "internal_docs",
            "category": "technical",
            "timestamp": "2024-01-15T10:30:00Z",
            "author": "john.doe",
            "language": "ru"
        }
    )
])
```

### 4. Мониторинг и оптимизация

```python
# Метрики для мониторинга векторного хранилища
monitoring_metrics = {
    "search_latency": "Время ответа на запросы",
    "index_size": "Размер индекса в памяти",
    "memory_usage": "Использование оперативной памяти",
    "disk_usage": "Использование дискового пространства",
    "query_throughput": "Количество запросов в секунду",
    "accuracy_metrics": "Точность поиска (recall@k)"
}
```

## Интеграция с RAG системами

### Базовая интеграция

```python
# Создание RAG цепочки с векторным хранилищем
from langchain.chains import RetrievalQA

# Настройка ретривера
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={
        "k": 5,  # Количество документов для извлечения
        "score_threshold": 0.7  # Минимальный порог сходства
    }
)

# Создание QA цепочки
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0),
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)
```

### Продвинутая интеграция

```python
# Гибридный поиск (векторный + ключевые слова)
class HybridRetriever:
    def __init__(self, vector_store, keyword_search):
        self.vector_store = vector_store
        self.keyword_search = keyword_search
    
    def retrieve(self, query, k=5):
        # Векторный поиск
        vector_results = self.vector_store.similarity_search(query, k=k//2)
        
        # Поиск по ключевым словам
        keyword_results = self.keyword_search.search(query, k=k//2)
        
        # Объединение и ранжирование результатов
        combined_results = self.merge_and_rank(vector_results, keyword_results)
        
        return combined_results[:k]
```

## Узлы векторных хранилищ:

* [AstraDB](astradb.md)
* [Chroma](chroma.md)
* [Couchbase](couchbase.md)
* [Elastic](elastic.md)
* [Faiss](faiss.md)
* [Векторное хранилище в памяти](in-memory-vector-store.md)
* [Milvus](milvus.md)
* [MongoDB Atlas](mongodb-atlas.md)
* [OpenSearch](opensearch.md)
* [Pinecone](pinecone.md)
* [Postgres](postgres.md)
* [Qdrant](qdrant.md)
* [Redis](redis.md)
* [SingleStore](singlestore.md)
* [Supabase](supabase.md)
* [Upstash Vector](upstash-vector.md)
* [Vectara](vectara.md)
* [Weaviate](weaviate.md)
* [Zep Collection - Open Source](zep-collection-open-source.md)
* [Zep Collection - Cloud](zep-collection-cloud.md)

## Заключение

Векторные хранилища являются фундаментальным компонентом современных AI-приложений. Правильный выбор и настройка векторного хранилища критически важны для производительности, масштабируемости и точности ваших систем.

Ключевые факторы успеха:
- **Выбор подходящего решения** на основе требований проекта
- **Оптимизация эмбеддингов** для вашего домена
- **Правильная настройка индексов** для баланса скорости и точности
- **Мониторинг производительности** и регулярная оптимизация
- **Планирование масштабирования** с ростом данных

Начните с простых решений для прототипирования и переходите к более сложным по мере роста требований вашего проекта.
