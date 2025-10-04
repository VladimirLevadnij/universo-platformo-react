---
description: Узлы памяти LangChain
---

# Память

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Память позволяет вам общаться с ИИ так, как будто у ИИ есть память о предыдущих разговорах.

_<mark style="color:blue;">Человек: привет, меня зовут Боб</mark>_

_<mark style="color:orange;">ИИ: Привет, Боб! Приятно познакомиться. Как я могу помочь вам сегодня?</mark>_

_<mark style="color:blue;">Человек: как меня зовут?</mark>_

_<mark style="color:orange;">ИИ: Вас зовут Боб, как вы упомянули ранее.</mark>_

## Что такое память в LangChain?

Память в контексте LangChain - это способность системы сохранять и использовать информацию из предыдущих взаимодействий. Это критически важно для создания естественных диалоговых интерфейсов.

### Принцип работы

Под капотом эти разговоры сохраняются в массивах или базах данных и предоставляются как контекст для LLM. Например:

```
Вы ассистент человека, работающий на основе большой языковой модели, обученной OpenAI.

Независимо от того, нужна ли человеку помощь с конкретным вопросом или он просто хочет поговорить на определенную тему, вы здесь, чтобы помочь.

Текущий разговор:
{history}
```

## Типы памяти

### 1. Буферная память (Buffer Memory)
- **Сохраняет все сообщения** в исходном виде
- **Простая в реализации** и понимании
- **Ограничена размером контекста** модели
- **Подходит для коротких диалогов**

### 2. Оконная память (Window Memory)
- **Сохраняет только последние N сообщений**
- **Контролирует размер контекста**
- **Может терять важную информацию** из начала диалога
- **Подходит для длинных диалогов** с ограниченным контекстом

### 3. Сводная память (Summary Memory)
- **Сжимает старые сообщения** в краткое изложение
- **Сохраняет ключевую информацию** из всего диалога
- **Требует дополнительные вызовы LLM** для создания сводок
- **Подходит для очень длинных диалогов**

### 4. Комбинированная память (Summary Buffer Memory)
- **Объединяет буферную и сводную память**
- **Сохраняет недавние сообщения полностью**
- **Сжимает старые сообщения** в сводку
- **Оптимальный баланс** между детализацией и размером

### 5. Векторная память (Vector Memory)
- **Использует семантический поиск** для извлечения релевантной информации
- **Масштабируется на большие объемы** истории
- **Извлекает контекстуально релевантные** фрагменты
- **Подходит для долгосрочной памяти**

## Архитектура системы памяти

```
Пользовательский ввод → Обновление памяти → Извлечение контекста → LLM → Ответ
         ↑                    ↓                    ↓              ↓       ↓
    История ←← Сохранение ←← Форматирование ←← Контекст ←← Обновление
```

### Компоненты системы памяти:

1. **Хранилище** - где сохраняются данные (память, БД, файлы)
2. **Менеджер памяти** - управляет сохранением и извлечением
3. **Форматтер** - преобразует данные в нужный формат
4. **Стратегия извлечения** - определяет, какую информацию использовать
5. **Очистка** - управляет размером и актуальностью данных

## Лучшие практики использования памяти

### 1. Выбор типа памяти

```python
# Для коротких диалогов (< 10 сообщений)
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Для средних диалогов (10-50 сообщений)
memory = ConversationBufferWindowMemory(
    k=10,  # Последние 10 сообщений
    memory_key="chat_history",
    return_messages=True
)

# Для длинных диалогов (> 50 сообщений)
memory = ConversationSummaryBufferMemory(
    llm=ChatOpenAI(temperature=0),
    max_token_limit=1000,
    memory_key="chat_history",
    return_messages=True
)

# Для долгосрочной памяти
memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs=dict(k=5)),
    memory_key="chat_history"
)
```

### 2. Настройка параметров

```yaml
# Конфигурация памяти для разных сценариев
customer_support:
  type: "ConversationSummaryBufferMemory"
  max_token_limit: 2000
  summary_prompt: "Кратко изложи ключевые проблемы клиента и предпринятые действия"
  
educational_assistant:
  type: "ConversationBufferWindowMemory"
  k: 15
  include_metadata: true
  
personal_assistant:
  type: "VectorStoreRetrieverMemory"
  retriever_k: 10
  similarity_threshold: 0.8
```

### 3. Управление контекстом

```python
class ContextManager:
    def __init__(self, memory, max_context_length=4000):
        self.memory = memory
        self.max_context_length = max_context_length
    
    def get_context(self, current_input):
        # Получить историю из памяти
        history = self.memory.load_memory_variables({})
        
        # Проверить размер контекста
        context_size = self.estimate_token_count(history, current_input)
        
        if context_size > self.max_context_length:
            # Сжать контекст если необходимо
            history = self.compress_context(history)
        
        return history
    
    def compress_context(self, history):
        # Логика сжатия контекста
        # Может включать суммаризацию или удаление старых сообщений
        pass
```

## Персистентность памяти

### 1. Локальное хранение

```python
# Сохранение в файл
import pickle

def save_memory(memory, filename):
    with open(filename, 'wb') as f:
        pickle.dump(memory.chat_memory, f)

def load_memory(filename):
    with open(filename, 'rb') as f:
        chat_memory = pickle.load(f)
    
    memory = ConversationBufferMemory()
    memory.chat_memory = chat_memory
    return memory
```

### 2. База данных

```python
# Интеграция с Redis
from langchain.memory import RedisChatMessageHistory

memory = ConversationBufferMemory(
    chat_memory=RedisChatMessageHistory(
        session_id="user_123",
        url="redis://localhost:6379"
    ),
    memory_key="chat_history",
    return_messages=True
)
```

### 3. Облачные решения

```python
# Интеграция с MongoDB Atlas
from langchain.memory import MongoDBChatMessageHistory

memory = ConversationBufferMemory(
    chat_memory=MongoDBChatMessageHistory(
        connection_string="mongodb+srv://...",
        session_id="user_123",
        database_name="chat_history",
        collection_name="conversations"
    )
)
```

## Узлы памяти:

* [Буферная память](buffer-memory.md)
* [Оконная буферная память](buffer-window-memory.md)
* [Сводная память разговора](conversation-summary-memory.md)
* [Сводная буферная память разговора](conversation-summary-buffer-memory.md)
* [Память чата DynamoDB](dynamodb-chat-memory.md)
* [Память Mem0](mem0-memory.md)
* [Память чата MongoDB Atlas](mongodb-atlas-chat-memory.md)
* [Память чата на основе Redis](redis-backed-chat-memory.md)
* [Память чата на основе Upstash Redis](upstash-redis-backed-chat-memory.md)
* [Память Zep](zep-memory.md)

## Разделение разговоров для нескольких пользователей

### UI и встроенный чат

По умолчанию UI и встроенный чат автоматически разделяют разговоры разных пользователей. Это делается путем генерации уникального **`chatId`** для каждого нового взаимодействия. Эта логика обрабатывается под капотом Flowise.

### Prediction API

Вы можете разделить разговоры для нескольких пользователей, указав уникальный **`sessionId`**

1. Для каждого узла памяти вы должны увидеть входной параметр **`Session ID`**

<figure><img src="../../../.gitbook/assets/image (76).png" alt="" width="563"><figcaption></figcaption></figure>

<figure><img src="../../../.gitbook/assets/Untitled (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

2. В POST запросе `/api/v1/prediction/{your-canvasid}` укажите **`sessionId`** в **`overrideConfig`**

```json
{
    "question": "привет!",
    "overrideConfig": {
        "sessionId": "user1"
    }
}
```

### Message API

* GET `/api/v1/chatmessage/{your-canvasid}`
* DELETE `/api/v1/chatmessage/{your-canvasid}`

<table><thead><tr><th>Параметр запроса</th><th width="192">Тип</th><th>Значение</th></tr></thead><tbody><tr><td>sessionId</td><td>string</td><td></td></tr><tr><td>sort</td><td>enum</td><td>ASC или DESC</td></tr><tr><td>startDate</td><td>string</td><td></td></tr><tr><td>endDate</td><td>string</td><td></td></tr></tbody></table>

Все разговоры можно визуализировать и управлять ими из UI:

<figure><img src="../../../.gitbook/assets/image (78).png" alt=""><figcaption></figcaption></figure>

Для OpenAI Assistant будут использоваться [Threads](../agents/openai-assistant/threads.md) для хранения разговоров.

## Мониторинг и оптимизация памяти

### 1. Метрики памяти

```python
class MemoryMonitor:
    def __init__(self):
        self.metrics = {
            "memory_size": 0,
            "context_length": 0,
            "retrieval_time": 0,
            "compression_ratio": 0
        }
    
    def track_memory_usage(self, memory):
        # Отслеживание использования памяти
        self.metrics["memory_size"] = len(memory.chat_memory.messages)
        self.metrics["context_length"] = self.calculate_context_length(memory)
    
    def optimize_memory(self, memory):
        # Оптимизация памяти на основе метрик
        if self.metrics["context_length"] > 4000:
            return self.compress_memory(memory)
        return memory
```

### 2. A/B тестирование стратегий памяти

```python
class MemoryStrategy:
    def __init__(self, strategy_type, config):
        self.strategy_type = strategy_type
        self.config = config
        self.performance_metrics = {}
    
    def evaluate_performance(self, conversations):
        # Оценка производительности стратегии памяти
        metrics = {
            "response_quality": self.measure_response_quality(conversations),
            "context_relevance": self.measure_context_relevance(conversations),
            "memory_efficiency": self.measure_memory_efficiency(conversations)
        }
        return metrics
```

## Безопасность и приватность

### 1. Шифрование данных

```python
from cryptography.fernet import Fernet

class EncryptedMemory:
    def __init__(self, base_memory, encryption_key):
        self.base_memory = base_memory
        self.cipher = Fernet(encryption_key)
    
    def save_context(self, inputs, outputs):
        # Шифрование перед сохранением
        encrypted_inputs = self.encrypt_data(inputs)
        encrypted_outputs = self.encrypt_data(outputs)
        self.base_memory.save_context(encrypted_inputs, encrypted_outputs)
    
    def load_memory_variables(self, inputs):
        # Расшифровка при загрузке
        encrypted_memory = self.base_memory.load_memory_variables(inputs)
        return self.decrypt_data(encrypted_memory)
```

### 2. Управление сессиями

```python
class SessionManager:
    def __init__(self):
        self.active_sessions = {}
        self.session_timeout = 3600  # 1 час
    
    def create_session(self, user_id):
        session_id = self.generate_session_id()
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "created_at": time.time(),
            "memory": self.create_memory_for_user(user_id)
        }
        return session_id
    
    def cleanup_expired_sessions(self):
        current_time = time.time()
        expired_sessions = [
            sid for sid, session in self.active_sessions.items()
            if current_time - session["created_at"] > self.session_timeout
        ]
        
        for sid in expired_sessions:
            del self.active_sessions[sid]
```

## Заключение

Память является критически важным компонентом для создания естественных и контекстно-осведомленных диалоговых систем. Правильный выбор типа памяти, настройка параметров и управление жизненным циклом данных определяют качество пользовательского опыта.

Ключевые принципы успешного использования памяти:
- **Выбирайте тип памяти** в зависимости от длины и характера диалогов
- **Мониторьте размер контекста** и оптимизируйте при необходимости
- **Обеспечивайте персистентность** для долгосрочных взаимодействий
- **Защищайте приватные данные** с помощью шифрования
- **Тестируйте разные стратегии** для оптимизации производительности
