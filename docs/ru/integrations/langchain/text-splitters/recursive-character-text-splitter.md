---
description: >-
  Рекурсивно разбивает документы по различным символам - начиная с "\n\n",
  затем "\n", затем " ".
---

# Рекурсивный символьный разделитель текста

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

<figure><img src="../../../.gitbook/assets/image (155).png" alt="" width="305"><figcaption><p>Узел рекурсивного символьного разделителя текста</p></figcaption></figure>

## Что такое рекурсивный символьный разделитель текста?

Рекурсивный символьный разделитель текста - это наиболее универсальный и часто используемый разделитель в LangChain. Он работает по принципу **иерархического разделения**, пытаясь сохранить семантически связанные фрагменты текста вместе.

### Принцип работы

Разделитель использует **список разделителей в порядке приоритета**:

1. **`"\n\n"`** - разделение по абзацам (наивысший приоритет)
2. **`"\n"`** - разделение по строкам
3. **`" "`** - разделение по словам
4. **`""`** - разделение по символам (последний резерв)

### Алгоритм разделения

```python
# Псевдокод алгоритма рекурсивного разделения
def recursive_split(text, separators, chunk_size, chunk_overlap):
    if len(text) <= chunk_size:
        return [text]  # Текст уже достаточно мал
    
    # Пробуем разделители по порядку приоритета
    for separator in separators:
        if separator in text:
            # Разбиваем по текущему разделителю
            splits = text.split(separator)
            
            # Рекурсивно обрабатываем каждую часть
            good_splits = []
            for split in splits:
                if len(split) <= chunk_size:
                    good_splits.append(split)
                else:
                    # Если часть все еще слишком большая, 
                    # рекурсивно применяем следующие разделители
                    good_splits.extend(
                        recursive_split(split, separators[1:], chunk_size, chunk_overlap)
                    )
            
            # Объединяем части с учетом размера и перекрытия
            return merge_splits(good_splits, separator, chunk_size, chunk_overlap)
    
    # Если никакие разделители не найдены, принудительно разбиваем
    return force_split(text, chunk_size, chunk_overlap)
```

## Конфигурация узла

### Основные параметры

```yaml
recursive_character_splitter_config:
  chunk_size: 1000          # Максимальный размер чанка в символах
  chunk_overlap: 200        # Размер перекрытия между чанками
  length_function: len      # Функция измерения длины
  separators:               # Список разделителей по приоритету
    - "\n\n"               # Абзацы
    - "\n"                 # Строки  
    - " "                  # Слова
    - ""                   # Символы
  keep_separator: true      # Сохранять разделители в тексте
  add_start_index: false    # Добавлять индекс начала в метаданные
```

### Продвинутые настройки

```python
# Настройка для различных типов документов
document_type_configs = {
    "general_text": {
        "chunk_size": 1000,
        "chunk_overlap": 200,
        "separators": ["\n\n", "\n", " ", ""]
    },
    
    "technical_docs": {
        "chunk_size": 1500,
        "chunk_overlap": 300,
        "separators": ["\n\n", "\n", ". ", " ", ""]
    },
    
    "code_mixed": {
        "chunk_size": 1200,
        "chunk_overlap": 250,
        "separators": ["\n\n", "\n", "```", " ", ""]
    },
    
    "legal_text": {
        "chunk_size": 800,
        "chunk_overlap": 150,
        "separators": ["\n\n", "\n", ". ", "; ", " ", ""]
    },
    
    "academic_papers": {
        "chunk_size": 1500,
        "chunk_overlap": 300,
        "separators": ["\n\n", "\n", ". ", " ", ""]
    }
}
```

## Преимущества рекурсивного подхода

### 1. Сохранение семантической структуры

```python
# Пример работы с абзацами
text = """
Первый абзац содержит важную информацию о теме A.
Он состоит из нескольких предложений, связанных общей темой.

Второй абзац переходит к теме B.
Здесь обсуждаются другие аспекты проблемы.

Третий абзац заключает обсуждение.
"""

# Рекурсивный разделитель сначала попытается разделить по "\n\n"
# Это сохранит целостность каждого абзаца
chunks = [
    "Первый абзац содержит важную информацию о теме A.\nОн состоит из нескольких предложений, связанных общей темой.",
    "Второй абзац переходит к теме B.\nЗдесь обсуждаются другие аспекты проблемы.",
    "Третий абзац заключает обсуждение."
]
```

### 2. Адаптивность к размеру

```python
# Если абзац слишком большой, разделитель перейдет к следующему уровню
large_paragraph = """
Это очень длинный абзац, который содержит множество предложений и превышает установленный лимит размера чанка. 
Первое предложение говорит об одном аспекте. 
Второе предложение развивает эту тему дальше. 
Третье предложение добавляет дополнительные детали. 
Четвертое предложение заключает мысль.
"""

# Если весь абзац не помещается в chunk_size,
# разделитель попробует разделить по "\n", затем по " "
```

### 3. Гибкость настройки

```python
# Кастомные разделители для специфических случаев
class CustomRecursiveSplitter:
    def __init__(self, document_type="general"):
        self.separators = self.get_separators_for_type(document_type)
    
    def get_separators_for_type(self, doc_type):
        separators_map = {
            "markdown": ["\n## ", "\n### ", "\n\n", "\n", " ", ""],
            "code": ["\nclass ", "\ndef ", "\n\n", "\n", " ", ""],
            "dialogue": ["\n\n", "\n- ", "\n", " ", ""],
            "legal": ["\n\n", "\n", ". ", "; ", ", ", " ", ""],
            "scientific": ["\n\n", "\n", ". ", " et al. ", " ", ""]
        }
        return separators_map.get(doc_type, ["\n\n", "\n", " ", ""])
```

## Практические примеры использования

### Пример 1: Обработка технической документации

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Настройка для технической документации
tech_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=300,
    length_function=len,
    separators=[
        "\n## ",      # Заголовки второго уровня
        "\n### ",     # Заголовки третьего уровня
        "\n\n",       # Абзацы
        "\n",         # Строки
        ". ",         # Предложения
        " ",          # Слова
        ""            # Символы
    ]
)

# Пример технического текста
tech_text = """
## Установка системы

Для установки системы выполните следующие шаги:

1. Скачайте установочный файл
2. Запустите установку с правами администратора
3. Следуйте инструкциям мастера установки

### Системные требования

Минимальные требования:
- ОС: Windows 10 или выше
- RAM: 8 GB
- Свободное место: 2 GB

### Настройка после установки

После установки необходимо:
1. Настроить подключение к базе данных
2. Импортировать начальные данные
3. Настроить права пользователей
"""

chunks = tech_splitter.split_text(tech_text)
for i, chunk in enumerate(chunks):
    print(f"Чанк {i+1}:")
    print(chunk)
    print("-" * 50)
```

### Пример 2: Обработка диалогов и интервью

```python
# Специальная настройка для диалогов
dialogue_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=[
        "\n\n",       # Разделение между репликами
        "\n- ",       # Начало новой реплики
        "\n",         # Строки
        ". ",         # Предложения
        " ",          # Слова
        ""            # Символы
    ]
)

dialogue_text = """
- Интервьюер: Расскажите о вашем опыте работы в области машинного обучения.

- Кандидат: Я работаю в этой области уже пять лет. Начинал с простых задач классификации, затем перешел к более сложным проектам с глубоким обучением.

- Интервьюер: Какие технологии вы используете в своей работе?

- Кандидат: Основные инструменты - это Python, TensorFlow, PyTorch. Также активно использую библиотеки для обработки данных как pandas и numpy.
"""

dialogue_chunks = dialogue_splitter.split_text(dialogue_text)
```

### Пример 3: Обработка научных статей

```python
# Настройка для научных текстов
scientific_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1200,
    chunk_overlap=250,
    separators=[
        "\n\n",           # Абзацы
        "\n",             # Строки
        ". ",             # Предложения
        " et al. ",       # Научные ссылки
        " (2023) ",       # Годы публикаций
        " ",              # Слова
        ""                # Символы
    ]
)

scientific_text = """
Введение

Машинное обучение стало ключевой технологией в современном мире (Smith et al., 2023). 
Исследования показывают, что глубокие нейронные сети способны решать сложные задачи 
с высокой точностью (Johnson, 2022).

Методология

В данном исследовании мы использовали архитектуру трансформеров для задачи 
классификации текста. Набор данных состоял из 10,000 документов, 
размеченных экспертами (Brown et al., 2021).
"""

scientific_chunks = scientific_splitter.split_text(scientific_text)
```

## Оптимизация производительности

### Кэширование результатов

```python
import hashlib
from functools import lru_cache

class CachedRecursiveSplitter:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        self.cache = {}
    
    def split_text(self, text):
        # Создаем хеш текста для кэширования
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        if text_hash in self.cache:
            return self.cache[text_hash]
        
        chunks = self.splitter.split_text(text)
        self.cache[text_hash] = chunks
        
        return chunks
    
    def clear_cache(self):
        self.cache.clear()
```

### Пакетная обработка

```python
class BatchRecursiveSplitter:
    def __init__(self, chunk_size=1000, chunk_overlap=200, batch_size=10):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        self.batch_size = batch_size
    
    def split_documents(self, documents):
        all_chunks = []
        
        # Обработка документов батчами
        for i in range(0, len(documents), self.batch_size):
            batch = documents[i:i + self.batch_size]
            
            batch_chunks = []
            for doc in batch:
                chunks = self.splitter.split_text(doc["content"])
                
                # Добавление метаданных к каждому чанку
                for j, chunk in enumerate(chunks):
                    chunk_metadata = {
                        **doc.get("metadata", {}),
                        "chunk_index": j,
                        "total_chunks": len(chunks),
                        "source_document": doc.get("id", "unknown")
                    }
                    
                    batch_chunks.append({
                        "content": chunk,
                        "metadata": chunk_metadata
                    })
            
            all_chunks.extend(batch_chunks)
            
            # Логирование прогресса
            print(f"Обработано {min(i + self.batch_size, len(documents))} из {len(documents)} документов")
        
        return all_chunks
```

## Мониторинг и отладка

### Анализ качества разделения

```python
class SplitterAnalyzer:
    def __init__(self, splitter):
        self.splitter = splitter
    
    def analyze_splitting(self, text):
        chunks = self.splitter.split_text(text)
        
        analysis = {
            "total_chunks": len(chunks),
            "chunk_sizes": [len(chunk) for chunk in chunks],
            "avg_chunk_size": sum(len(chunk) for chunk in chunks) / len(chunks),
            "size_distribution": self.get_size_distribution(chunks),
            "overlap_analysis": self.analyze_overlaps(chunks),
            "separator_usage": self.analyze_separator_usage(text, chunks)
        }
        
        return analysis
    
    def get_size_distribution(self, chunks):
        sizes = [len(chunk) for chunk in chunks]
        return {
            "min": min(sizes),
            "max": max(sizes),
            "median": sorted(sizes)[len(sizes)//2],
            "std_dev": self.calculate_std_dev(sizes)
        }
    
    def analyze_overlaps(self, chunks):
        overlaps = []
        for i in range(len(chunks) - 1):
            overlap = self.find_overlap(chunks[i], chunks[i+1])
            overlaps.append(len(overlap))
        
        return {
            "avg_overlap": sum(overlaps) / len(overlaps) if overlaps else 0,
            "overlap_distribution": overlaps
        }
    
    def find_overlap(self, chunk1, chunk2):
        # Поиск перекрытия между чанками
        max_overlap = min(len(chunk1), len(chunk2))
        
        for i in range(max_overlap, 0, -1):
            if chunk1[-i:] == chunk2[:i]:
                return chunk1[-i:]
        
        return ""
```

### Визуализация результатов

```python
import matplotlib.pyplot as plt

class SplitterVisualizer:
    def __init__(self):
        pass
    
    def plot_chunk_sizes(self, chunks, title="Распределение размеров чанков"):
        sizes = [len(chunk) for chunk in chunks]
        
        plt.figure(figsize=(10, 6))
        plt.hist(sizes, bins=20, alpha=0.7, edgecolor='black')
        plt.title(title)
        plt.xlabel('Размер чанка (символы)')
        plt.ylabel('Количество чанков')
        plt.grid(True, alpha=0.3)
        plt.show()
    
    def plot_overlap_analysis(self, chunks):
        overlaps = []
        for i in range(len(chunks) - 1):
            overlap = self.find_overlap(chunks[i], chunks[i+1])
            overlaps.append(len(overlap))
        
        plt.figure(figsize=(12, 4))
        plt.plot(range(len(overlaps)), overlaps, marker='o')
        plt.title('Размер перекрытий между соседними чанками')
        plt.xlabel('Индекс чанка')
        plt.ylabel('Размер перекрытия (символы)')
        plt.grid(True, alpha=0.3)
        plt.show()
```

## Лучшие практики

### 1. Выбор оптимального размера чанка

```python
# Рекомендации по размеру чанка для различных задач
chunk_size_recommendations = {
    "qa_systems": {
        "size": 500-1000,
        "reason": "Баланс между контекстом и точностью поиска"
    },
    "summarization": {
        "size": 1500-3000,
        "reason": "Больше контекста для качественного резюмирования"
    },
    "embedding_search": {
        "size": 200-800,
        "reason": "Оптимальный размер для векторного поиска"
    },
    "chat_context": {
        "size": 1000-2000,
        "reason": "Достаточный контекст для диалога"
    }
}
```

### 2. Настройка перекрытий

```python
# Стратегии перекрытия
overlap_strategies = {
    "minimal": {
        "overlap_ratio": 0.1,  # 10% от chunk_size
        "use_case": "Уникальная информация в каждом чанке"
    },
    "standard": {
        "overlap_ratio": 0.2,  # 20% от chunk_size
        "use_case": "Общее использование"
    },
    "high_context": {
        "overlap_ratio": 0.3,  # 30% от chunk_size
        "use_case": "Сохранение максимального контекста"
    }
}
```

### 3. Валидация результатов

```python
def validate_chunks(chunks, min_size=50, max_size=2000):
    """Валидация результатов разделения"""
    issues = []
    
    for i, chunk in enumerate(chunks):
        # Проверка размера
        if len(chunk) < min_size:
            issues.append(f"Чанк {i} слишком мал: {len(chunk)} символов")
        
        if len(chunk) > max_size:
            issues.append(f"Чанк {i} слишком велик: {len(chunk)} символов")
        
        # Проверка на пустые чанки
        if not chunk.strip():
            issues.append(f"Чанк {i} пустой или содержит только пробелы")
        
        # Проверка на обрывы предложений
        if not chunk.strip().endswith(('.', '!', '?', '\n')):
            issues.append(f"Чанк {i} может содержать обрывы предложений")
    
    return issues
```

## Заключение

Рекурсивный символьный разделитель текста является наиболее универсальным и эффективным инструментом для разбиения текста в большинстве случаев использования. Его иерархический подход к разделению позволяет сохранять семантическую структуру документов, адаптируясь к различным типам контента.

Ключевые преимущества:
- **Сохранение семантической структуры** через иерархическое разделение
- **Адаптивность** к различным типам документов
- **Гибкость настройки** разделителей и параметров
- **Оптимальный баланс** между размером чанков и сохранением контекста
- **Широкая применимость** для большинства задач NLP

Для достижения наилучших результатов рекомендуется тестировать различные конфигурации на ваших данных и мониторить качество разделения.
