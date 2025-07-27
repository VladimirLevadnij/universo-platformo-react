---
description: Узнайте, как использовать хранилища документов Flowise, написано @toi500
---

# Хранилища документов

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Хранилища документов Flowise предлагают универсальный подход к управлению данными, позволяя загружать, разбивать и подготавливать ваш набор данных и загружать его в одном месте.

Этот централизованный подход упрощает обработку данных и позволяет эффективно управлять различными форматами данных, облегчая организацию и доступ к вашим данным в приложении Flowise.

## Что такое хранилища документов?

Хранилища документов - это централизованная система управления данными, которая:

- **Объединяет процессы** загрузки, обработки и индексации документов
- **Поддерживает множество форматов** - PDF, Word, текст, веб-страницы и др.
- **Автоматизирует подготовку данных** для векторного поиска
- **Обеспечивает версионность** и отслеживание изменений
- **Упрощает интеграцию** с RAG системами

### Архитектура хранилища документов

```
Документы → Загрузчик → Разбиение → Эмбеддинги → Векторное хранилище
     ↓           ↓          ↓           ↓              ↓
Метаданные → Обработка → Чанки → Индексация → Поиск по сходству
```

## Настройка

В этом учебнике мы настроим систему [Retrieval Augmented Generation (RAG)](broken-reference) для получения информации о _Полисе домовладельцев LibertyGuard Deluxe_ - теме, по которой LLM не имеют обширной подготовки.

Используя **хранилища документов Flowise**, мы подготовим и загрузим данные о LibertyGuard и его наборе полисов страхования жилья. Это позволит нашей RAG системе точно отвечать на пользовательские запросы о предложениях страхования жилья LibertyGuard.

## 1. Добавление хранилища документов

Начните с добавления хранилища документов и присвоения ему имени. В нашем случае "Полис домовладельцев LibertyGuard Deluxe".

<figure><img src="../.gitbook/assets/ds01.png" alt=""><figcaption></figcaption></figure>

### Лучшие практики именования

```yaml
# Рекомендации по именованию хранилищ
naming_conventions:
  descriptive: "Используйте описательные имена"
  consistent: "Следуйте единому стилю"
  versioned: "Включайте версии при необходимости"
  
examples:
  good:
    - "Техническая документация v2.1"
    - "Корпоративные политики 2024"
    - "База знаний поддержки клиентов"
  
  avoid:
    - "docs"
    - "test123"
    - "новая папка"
```

## 2. Выбор загрузчика документов

Войдите в только что созданное хранилище документов и выберите [загрузчик документов](../integrations/langchain/document-loaders/), который хотите использовать. В нашем случае, поскольку наш набор данных в формате PDF, мы будем использовать [PDF загрузчик](../integrations/langchain/document-loaders/pdf-file.md).

Загрузчики документов - это специализированные узлы, которые обрабатывают прием различных форматов документов.

<figure><img src="../.gitbook/assets/ds02.png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/ds03.png" alt=""><figcaption></figcaption></figure>

### Типы загрузчиков документов

```python
# Выбор загрузчика по типу документа
document_loaders = {
    "pdf": {
        "loader": "PDFLoader",
        "features": ["Извлечение текста", "Сохранение структуры", "Обработка изображений"],
        "use_cases": ["Технические документы", "Отчеты", "Руководства"]
    },
    
    "web": {
        "loader": "WebScraper", 
        "features": ["Парсинг HTML", "Следование ссылкам", "Обработка JavaScript"],
        "use_cases": ["Веб-сайты", "Блоги", "Онлайн документация"]
    },
    
    "office": {
        "loader": "UnstructuredLoader",
        "features": ["Word", "Excel", "PowerPoint"],
        "use_cases": ["Корпоративные документы", "Презентации", "Таблицы"]
    },
    
    "code": {
        "loader": "GitHubLoader",
        "features": ["Репозитории", "Файлы кода", "README"],
        "use_cases": ["Документация API", "Примеры кода", "Техническая база знаний"]
    }
}
```

## 3. Подготовка ваших данных

### Шаг 1: Загрузчик документов

* Сначала мы начинаем с загрузки нашего PDF файла.
* Затем добавляем **уникальный ключ метаданных**. Это необязательно, но хорошая практика, поскольку позволяет нам нацеливаться и фильтровать этот же набор данных позже, если потребуется.
* Каждый загрузчик поставляется с предварительно настроенными метаданными, в некоторых случаях вы можете использовать "Omit Metadata Keys" для удаления ненужных метаданных.

<figure><img src="../.gitbook/assets/ds04.png" alt=""><figcaption></figcaption></figure>

#### Управление метаданными

```python
# Пример структуры метаданных
metadata_structure = {
    "source": "libertyguard_policy.pdf",
    "document_type": "insurance_policy", 
    "version": "2024.1",
    "language": "ru",
    "department": "insurance",
    "classification": "public",
    "created_date": "2024-01-15",
    "last_modified": "2024-01-20",
    "author": "LibertyGuard Insurance",
    "page_count": 45,
    "file_size": "2.3MB"
}

# Фильтрация метаданных
useful_metadata = {
    "source": metadata_structure["source"],
    "document_type": metadata_structure["document_type"],
    "version": metadata_structure["version"],
    "department": metadata_structure["department"]
}
```

### Шаг 2: Разделитель текста

* Выберите [разделитель текста](../integrations/langchain/text-splitters/), который хотите использовать для разбиения ваших данных на части. В нашем конкретном случае мы будем использовать [рекурсивный символьный разделитель текста](../integrations/langchain/text-splitters/recursive-character-text-splitter.md).

* Разделитель текста используется для разбиения загруженных документов на более мелкие части, документы или чанки. Это критически важный этап предварительной обработки по 2 основным причинам:

#### Причины разбиения документов

**1. Скорость и релевантность поиска:**
Хранение и запрос больших документов как единых сущностей в векторной базе данных может привести к более медленному времени поиска и потенциально менее релевантным результатам. Разбиение документа на более мелкие части позволяет более целенаправленный поиск. Запрашивая более мелкие, более сфокусированные единицы информации, мы можем достичь более быстрого времени ответа и улучшить точность извлеченных результатов.

**2. Экономическая эффективность:**
Поскольку мы извлекаем только релевантные части, а не весь документ, количество токенов, обрабатываемых LLM, значительно сокращается. Этот целенаправленный подход к поиску напрямую приводит к снижению затрат на использование нашей LLM, поскольку биллинг обычно основан на потреблении токенов. Минимизируя количество нерелевантной информации, отправляемой в LLM, мы также оптимизируем затраты.

#### Стратегии разбиения текста

**Символьное разбиение текста:**
Разделение текста на части фиксированного количества символов. Этот метод прост, но может разбивать слова или фразы между частями, потенциально нарушая контекст.

**Токенное разбиение текста:**
Сегментация текста на основе границ слов или схем токенизации, специфичных для выбранной модели эмбеддингов. Этот подход часто приводит к более семантически связным частям, поскольку сохраняет границы слов и учитывает базовую лингвистическую структуру текста.

**Рекурсивное символьное разбиение текста:**
Эта стратегия направлена на разделение текста на части, которые поддерживают семантическую связность, оставаясь в пределах указанного размера. Она особенно хорошо подходит для иерархических документов с вложенными разделами или заголовками. Вместо слепого разбиения по лимиту символов, она рекурсивно анализирует текст для поиска логических точек разрыва, таких как окончания предложений или разрывы разделов.

**Markdown разделитель текста:**
Разработан специально для документов в формате markdown, этот разделитель логически сегментирует текст на основе заголовков markdown и структурных элементов, создавая части, которые соответствуют логическим разделам в документе.

**Разделитель кода:**
Адаптирован для разбиения файлов кода, эта стратегия учитывает структуру кода, определения функций и другие элементы, специфичные для языка программирования, для создания значимых частей, подходящих для задач поиска кода и документации.

**HTML-to-Markdown разделитель текста:**
Этот специализированный разделитель сначала конвертирует HTML контент в Markdown, а затем применяет Markdown разделитель текста, позволяя структурированную сегментацию веб-страниц и других HTML документов.

### Настройка параметров разбиения

```python
# Конфигурация разделителя текста
text_splitter_config = {
    "chunk_size": 1000,        # Размер части в символах
    "chunk_overlap": 200,      # Перекрытие между частями
    "length_function": len,    # Функция измерения длины
    "separators": [            # Приоритет разделителей
        "\n\n",               # Абзацы
        "\n",                 # Строки
        " ",                  # Слова
        ""                    # Символы
    ]
}

# Адаптивная настройка по типу документа
document_type_configs = {
    "technical_docs": {
        "chunk_size": 1500,
        "chunk_overlap": 300,
        "preserve_code_blocks": True
    },
    
    "legal_documents": {
        "chunk_size": 800,
        "chunk_overlap": 150,
        "preserve_sections": True
    },
    
    "marketing_content": {
        "chunk_size": 600,
        "chunk_overlap": 100,
        "preserve_paragraphs": True
    }
}
```

## 4. Векторизация и индексация

### Выбор модели эмбеддингов

```python
# Сравнение моделей эмбеддингов
embedding_models = {
    "openai_ada_002": {
        "dimensions": 1536,
        "cost": "Средняя",
        "quality": "Высокая",
        "languages": ["en", "ru", "многоязычная"],
        "use_case": "Универсальное использование"
    },
    
    "sentence_transformers": {
        "dimensions": 384,
        "cost": "Бесплатно",
        "quality": "Хорошая",
        "languages": ["ru", "en"],
        "use_case": "Локальное развертывание"
    },
    
    "cohere_multilingual": {
        "dimensions": 768,
        "cost": "Низкая",
        "quality": "Высокая",
        "languages": ["100+ языков"],
        "use_case": "Многоязычные приложения"
    }
}
```

### Оптимизация векторного хранилища

```python
# Настройки векторного хранилища
vector_store_config = {
    "index_type": "HNSW",           # Тип индекса
    "metric": "cosine",             # Метрика сходства
    "ef_construction": 200,         # Параметры построения
    "m": 16,                        # Количество соединений
    "max_elements": 100000,         # Максимум элементов
    "batch_size": 1000,             # Размер батча для загрузки
    "normalize_embeddings": True    # Нормализация векторов
}
```

## 5. Мониторинг и управление

### Метрики хранилища документов

```python
class DocumentStoreMetrics:
    def __init__(self):
        self.metrics = {
            "total_documents": 0,
            "total_chunks": 0,
            "average_chunk_size": 0,
            "storage_size": 0,
            "index_build_time": 0,
            "query_performance": []
        }
    
    def track_ingestion(self, documents, chunks, build_time):
        self.metrics["total_documents"] += len(documents)
        self.metrics["total_chunks"] += len(chunks)
        self.metrics["average_chunk_size"] = sum(
            len(chunk.page_content) for chunk in chunks
        ) / len(chunks)
        self.metrics["index_build_time"] = build_time
    
    def track_query(self, query_time, results_count):
        self.metrics["query_performance"].append({
            "time": query_time,
            "results": results_count,
            "timestamp": datetime.now()
        })
    
    def get_performance_report(self):
        avg_query_time = sum(
            q["time"] for q in self.metrics["query_performance"]
        ) / len(self.metrics["query_performance"])
        
        return {
            "documents": self.metrics["total_documents"],
            "chunks": self.metrics["total_chunks"],
            "avg_chunk_size": self.metrics["average_chunk_size"],
            "avg_query_time": f"{avg_query_time:.3f}s",
            "storage_efficiency": self.calculate_storage_efficiency()
        }
```

### Управление версиями документов

```python
class DocumentVersionManager:
    def __init__(self, store_name):
        self.store_name = store_name
        self.versions = {}
    
    def add_version(self, document_id, content, metadata):
        if document_id not in self.versions:
            self.versions[document_id] = []
        
        version = {
            "version": len(self.versions[document_id]) + 1,
            "content_hash": hashlib.md5(content.encode()).hexdigest(),
            "metadata": metadata,
            "timestamp": datetime.now(),
            "size": len(content)
        }
        
        self.versions[document_id].append(version)
        return version["version"]
    
    def get_latest_version(self, document_id):
        if document_id in self.versions:
            return self.versions[document_id][-1]
        return None
    
    def compare_versions(self, document_id, version1, version2):
        # Сравнение версий документа
        v1 = self.versions[document_id][version1 - 1]
        v2 = self.versions[document_id][version2 - 1]
        
        return {
            "content_changed": v1["content_hash"] != v2["content_hash"],
            "metadata_changed": v1["metadata"] != v2["metadata"],
            "size_diff": v2["size"] - v1["size"],
            "time_diff": v2["timestamp"] - v1["timestamp"]
        }
```

## 6. Лучшие практики

### Оптимизация производительности

```python
# Стратегии оптимизации
optimization_strategies = {
    "batch_processing": {
        "description": "Обработка документов батчами",
        "batch_size": 100,
        "parallel_workers": 4,
        "memory_limit": "2GB"
    },
    
    "incremental_updates": {
        "description": "Инкрементальные обновления",
        "check_interval": "1 hour",
        "change_detection": "content_hash",
        "update_strategy": "delta_only"
    },
    
    "caching": {
        "description": "Кэширование результатов",
        "cache_embeddings": True,
        "cache_chunks": True,
        "cache_ttl": "24 hours"
    },
    
    "compression": {
        "description": "Сжатие данных",
        "compress_text": True,
        "compress_embeddings": False,
        "algorithm": "gzip"
    }
}
```

### Безопасность и соответствие требованиям

```python
# Настройки безопасности
security_config = {
    "access_control": {
        "authentication": "required",
        "authorization": "role_based",
        "encryption_at_rest": True,
        "encryption_in_transit": True
    },
    
    "data_privacy": {
        "pii_detection": True,
        "data_masking": True,
        "retention_policy": "2 years",
        "deletion_policy": "secure_wipe"
    },
    
    "compliance": {
        "gdpr": True,
        "hipaa": False,
        "sox": True,
        "audit_logging": True
    },
    
    "backup_recovery": {
        "backup_frequency": "daily",
        "backup_retention": "30 days",
        "recovery_rto": "4 hours",
        "recovery_rpo": "1 hour"
    }
}
```

## Заключение

Хранилища документов Flowise предоставляют мощную и гибкую платформу для управления данными в RAG системах. Правильная настройка загрузчиков документов, разделителей текста и векторных хранилищ критически важна для достижения высокого качества поиска и производительности системы.

Ключевые принципы успешного использования хранилищ документов:
- **Выбирайте подходящие загрузчики** для каждого типа документов
- **Настраивайте разбиение текста** в соответствии с характером данных
- **Мониторьте производительность** и оптимизируйте параметры
- **Обеспечивайте безопасность** и соответствие требованиям
- **Планируйте масштабирование** с ростом объема данных
- **Документируйте процессы** для команды и аудита
