---
description: Узлы цепочек LangChain
---

# Цепочки

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

В контексте чатботов и больших языковых моделей "цепочки" обычно относятся к последовательностям текста или поворотам разговора. Эти цепочки используются для хранения и управления историей разговора и контекстом для чатбота или языковой модели. Цепочки помогают модели понимать продолжающийся разговор и предоставлять связные и контекстуально релевантные ответы.

## Как работают цепочки:

### 1. История разговора
Когда пользователь взаимодействует с чатботом или языковой моделью, разговор часто представляется как серия текстовых сообщений или поворотов разговора. Каждое сообщение от пользователя и модели сохраняется в хронологическом порядке для поддержания контекста разговора.

### 2. Ввод и вывод
Каждая цепочка состоит как из пользовательского ввода, так и из вывода модели. Ввод пользователя обычно называется "входной цепочкой", в то время как ответы модели сохраняются в "выходной цепочке". Это позволяет модели ссылаться на предыдущие сообщения в разговоре.

### 3. Контекстное понимание
Сохраняя всю историю разговора в этих цепочках, модель может понимать контекст и ссылаться на более ранние сообщения для предоставления связных и контекстуально релевантных ответов. Это критически важно для поддержания естественного и значимого разговора с пользователями.

### 4. Максимальная длина
Цепочки имеют максимальную длину для управления использованием памяти и вычислительными ресурсами. Когда цепочка становится слишком длинной, старые сообщения могут быть удалены или обрезаны, чтобы освободить место для новых сообщений. Это потенциально может привести к потере контекста, если важные детали разговора будут удалены.

### 5. Продолжение разговора
В режиме реального времени взаимодействия с чатботом или языковой моделью входная цепочка постоянно обновляется новыми сообщениями пользователя, а выходная цепочка обновляется ответами модели. Это позволяет модели отслеживать продолжающийся разговор и отвечать соответствующим образом.

## Типы цепочек

### Простые цепочки
- **LLM Chain** - базовая цепочка для взаимодействия с языковой моделью
- **Conversation Chain** - поддерживает историю разговора
- **Sequential Chain** - выполняет последовательность операций

### Цепочки вопросов и ответов
- **Retrieval QA Chain** - отвечает на вопросы на основе документов
- **Conversational Retrieval QA Chain** - QA с поддержкой диалога
- **VectorDB QA Chain** - использует векторные базы данных
- **Multi Retrieval QA Chain** - работает с множественными источниками

### API цепочки
- **GET API Chain** - выполняет GET запросы к API
- **POST API Chain** - выполняет POST запросы к API
- **OpenAPI Chain** - работает с OpenAPI спецификациями

### Специализированные цепочки
- **SQL Database Chain** - взаимодействует с SQL базами данных
- **Multi Prompt Chain** - использует множественные промпты
- **Vectara Chain** - интеграция с платформой Vectara

## Архитектура цепочек

```
Ввод → Предобработка → LLM → Постобработка → Вывод
  ↓         ↓           ↓         ↓           ↓
Память ← Контекст ← История ← Результат ← Форматирование
```

### Компоненты цепочки:

1. **Входной процессор** - обрабатывает пользовательский ввод
2. **Менеджер памяти** - управляет контекстом и историей
3. **Языковая модель** - генерирует ответы
4. **Выходной форматтер** - форматирует результат
5. **Валидатор** - проверяет корректность вывода

## Лучшие практики использования цепочек

### 1. Выбор подходящей цепочки

```python
# Для простых вопросов
simple_chain = LLMChain(
    llm=ChatOpenAI(),
    prompt=PromptTemplate(...)
)

# Для диалогов с памятью
conversation_chain = ConversationChain(
    llm=ChatOpenAI(),
    memory=ConversationBufferMemory()
)

# Для работы с документами
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(),
    retriever=vectorstore.as_retriever()
)
```

### 2. Управление памятью

```python
# Различные типы памяти
memory_types = {
    # Буферная память - сохраняет все
    "buffer": ConversationBufferMemory(),
    
    # Оконная память - ограниченное количество сообщений
    "window": ConversationBufferWindowMemory(k=5),
    
    # Сжатая память - сжимает старые сообщения
    "summary": ConversationSummaryMemory(
        llm=ChatOpenAI(),
        max_token_limit=1000
    ),
    
    # Векторная память - использует семантический поиск
    "vector": VectorStoreRetrieverMemory(
        retriever=vectorstore.as_retriever()
    )
}
```

### 3. Оптимизация производительности

```python
# Настройки для оптимизации
optimization_settings = {
    # Кэширование результатов
    "cache": True,
    
    # Параллельная обработка
    "parallel": True,
    
    # Ограничение токенов
    "max_tokens": 2000,
    
    # Таймауты
    "timeout": 30,
    
    # Повторные попытки
    "max_retries": 3
}
```

## Примеры реализации

### Простая цепочка вопросов и ответов

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Создание векторного хранилища
vectorstore = FAISS.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings()
)

# Создание цепочки QA
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(temperature=0),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# Использование
result = qa_chain({"query": "Что такое машинное обучение?"})
```

### Диалоговая цепочка с памятью

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

# Создание цепочки с памятью
conversation = ConversationChain(
    llm=ChatOpenAI(temperature=0.7),
    memory=ConversationBufferMemory(),
    verbose=True
)

# Диалог
response1 = conversation.predict(input="Привет! Меня зовут Алексей.")
response2 = conversation.predict(input="Как меня зовут?")
```

### API цепочка

```python
from langchain.chains import APIChain

# Создание API цепочки
api_chain = APIChain.from_llm_and_api_docs(
    llm=ChatOpenAI(),
    api_docs=api_documentation,
    verbose=True
)

# Использование
result = api_chain.run("Получи информацию о погоде в Москве")
```

## Мониторинг и отладка

### Логирование цепочек

```python
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Цепочка с логированием
class LoggedChain(BaseChain):
    def _call(self, inputs):
        logger.info(f"Входные данные: {inputs}")
        result = super()._call(inputs)
        logger.info(f"Результат: {result}")
        return result
```

### Метрики производительности

```python
import time
from functools import wraps

def measure_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        print(f"Время выполнения: {end_time - start_time:.2f} секунд")
        print(f"Использовано токенов: {result.get('token_usage', 'N/A')}")
        
        return result
    return wrapper

# Использование
@measure_performance
def run_chain(chain, query):
    return chain({"query": query})
```

## Узлы цепочек:

* [GET API цепочка](get-api-chain.md)
* [OpenAPI цепочка](openapi-chain.md)
* [POST API цепочка](post-api-chain.md)
* [Цепочка разговора](conversation-chain.md)
* [Конверсационная цепочка поиска QA](conversational-retrieval-qa-chain.md)
* [LLM цепочка](llm-chain.md)
* [Мульти-промпт цепочка](multi-prompt-chain.md)
* [Мульти-поисковая QA цепочка](multi-retrieval-qa-chain.md)
* [Поисковая QA цепочка](retrieval-qa-chain.md)
* [Цепочка SQL базы данных](sql-database-chain.md)
* [Vectara QA цепочка](vectara-chain.md)
* [VectorDB QA цепочка](vectordb-qa-chain.md)

## Заключение

Цепочки являются фундаментальной концепцией в построении и поддержании разговоров чатботов и языковых моделей. Они обеспечивают доступ модели к контексту, необходимому для генерации значимых и контекстно-осведомленных ответов, делая взаимодействие более привлекательным и полезным для пользователей.

Правильный выбор типа цепочки и настройка её компонентов критически важны для достижения желаемых результатов в различных сценариях использования.
