---
description: Узлы инструментов LangChain
---

# Инструменты

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Инструменты - это функции, которые агенты могут использовать для взаимодействия с внешним миром. Эти инструменты могут быть универсальными утилитами (например, поиск), другими цепочками или даже другими агентами.

## Что такое инструменты?

Инструменты представляют собой интерфейсы между агентами и внешними системами, позволяющие:

- **Получать информацию** из внешних источников
- **Выполнять действия** в различных системах
- **Обрабатывать данные** с помощью специализированных функций
- **Интегрироваться** с API и сервисами
- **Расширять возможности** агентов

## Категории инструментов

### 1. Поисковые инструменты
- **Web Search** - поиск информации в интернете
- **Database Search** - поиск в базах данных
- **Document Search** - поиск в документах
- **API Search** - поиск через внешние API

### 2. Вычислительные инструменты
- **Calculator** - математические вычисления
- **Python Interpreter** - выполнение Python кода
- **Data Analysis** - анализ данных
- **Statistical Tools** - статистические операции

### 3. Коммуникационные инструменты
- **Email** - отправка и получение электронной почты
- **Messaging** - обмен сообщениями
- **Notifications** - уведомления
- **Social Media** - взаимодействие с соцсетями

### 4. Файловые инструменты
- **File Operations** - работа с файлами
- **Document Processing** - обработка документов
- **Data Import/Export** - импорт и экспорт данных
- **Storage Management** - управление хранилищем

### 5. Интеграционные инструменты
- **API Clients** - клиенты для внешних API
- **Database Connectors** - подключения к БД
- **Cloud Services** - облачные сервисы
- **Enterprise Systems** - корпоративные системы

## Архитектура инструментов

```
Агент → Планировщик → Выбор инструмента → Выполнение → Результат
  ↑                                                        ↓
  ←←←←←←←←←←← Обратная связь ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### Компоненты инструмента:

1. **Интерфейс** - определение входных и выходных параметров
2. **Логика выполнения** - основная функциональность
3. **Обработка ошибок** - управление исключениями
4. **Валидация** - проверка входных данных
5. **Документация** - описание использования

## Лучшие практики использования инструментов

### 1. Выбор подходящих инструментов

```python
# Минимальный набор для базового агента
basic_tools = [
    "Calculator",           # Математические вычисления
    "WebSearch",           # Поиск информации
    "ReadFile",            # Чтение файлов
    "WriteFile"            # Запись файлов
]

# Расширенный набор для специализированного агента
advanced_tools = [
    "PythonInterpreter",   # Выполнение кода
    "DatabaseQuery",       # Запросы к БД
    "EmailSender",         # Отправка email
    "APIClient",           # Работа с API
    "DataAnalyzer"         # Анализ данных
]
```

### 2. Конфигурация инструментов

```yaml
# Пример конфигурации инструмента
calculator:
  name: "Calculator"
  description: "Выполняет математические вычисления"
  parameters:
    expression:
      type: "string"
      description: "Математическое выражение для вычисления"
      required: true
  timeout: 10
  retry_count: 3

web_search:
  name: "WebSearch"
  description: "Ищет информацию в интернете"
  parameters:
    query:
      type: "string"
      description: "Поисковый запрос"
      required: true
    max_results:
      type: "integer"
      description: "Максимальное количество результатов"
      default: 5
  api_key: "${SEARCH_API_KEY}"
  timeout: 30
```

### 3. Обработка ошибок

```python
class ToolExecutor:
    def execute_tool(self, tool_name, parameters):
        try:
            tool = self.get_tool(tool_name)
            result = tool.execute(parameters)
            return {"success": True, "result": result}
        
        except ToolNotFoundError:
            return {"success": False, "error": "Инструмент не найден"}
        
        except ValidationError as e:
            return {"success": False, "error": f"Ошибка валидации: {e}"}
        
        except TimeoutError:
            return {"success": False, "error": "Превышено время ожидания"}
        
        except Exception as e:
            return {"success": False, "error": f"Неожиданная ошибка: {e}"}
```

### 4. Мониторинг использования

```python
class ToolMonitor:
    def __init__(self):
        self.usage_stats = {}
        self.error_counts = {}
        self.performance_metrics = {}
    
    def log_tool_usage(self, tool_name, execution_time, success):
        # Логирование использования инструментов
        if tool_name not in self.usage_stats:
            self.usage_stats[tool_name] = 0
        self.usage_stats[tool_name] += 1
        
        # Метрики производительности
        if tool_name not in self.performance_metrics:
            self.performance_metrics[tool_name] = []
        self.performance_metrics[tool_name].append(execution_time)
        
        # Счетчик ошибок
        if not success:
            if tool_name not in self.error_counts:
                self.error_counts[tool_name] = 0
            self.error_counts[tool_name] += 1
```

## Создание пользовательских инструментов

### 1. Базовая структура

```python
from langchain.tools import BaseTool
from typing import Optional, Type
from pydantic import BaseModel, Field

class CustomToolInput(BaseModel):
    """Схема входных данных для пользовательского инструмента"""
    parameter1: str = Field(description="Описание первого параметра")
    parameter2: Optional[int] = Field(default=None, description="Описание второго параметра")

class CustomTool(BaseTool):
    name = "custom_tool"
    description = "Описание того, что делает инструмент"
    args_schema: Type[BaseModel] = CustomToolInput
    
    def _run(self, parameter1: str, parameter2: Optional[int] = None) -> str:
        """Основная логика инструмента"""
        try:
            # Ваша логика здесь
            result = self.process_data(parameter1, parameter2)
            return f"Результат: {result}"
        except Exception as e:
            return f"Ошибка: {str(e)}"
    
    def process_data(self, param1: str, param2: Optional[int]) -> str:
        """Вспомогательный метод для обработки данных"""
        # Реализация логики
        return "processed_data"
```

### 2. Интеграция с внешними API

```python
import requests
from typing import Dict, Any

class APITool(BaseTool):
    name = "api_client"
    description = "Выполняет запросы к внешнему API"
    
    def __init__(self, api_key: str, base_url: str):
        super().__init__()
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {api_key}"})
    
    def _run(self, endpoint: str, method: str = "GET", data: Dict[Any, Any] = None) -> str:
        """Выполняет API запрос"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            else:
                return f"Неподдерживаемый метод: {method}"
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            return f"Ошибка API запроса: {str(e)}"
```

## Безопасность инструментов

### 1. Валидация входных данных

```python
def validate_input(self, input_data: Dict[str, Any]) -> bool:
    """Валидация входных данных"""
    # Проверка на SQL инъекции
    dangerous_patterns = ["DROP", "DELETE", "UPDATE", "INSERT", "--", ";"]
    for value in input_data.values():
        if isinstance(value, str):
            for pattern in dangerous_patterns:
                if pattern.upper() in value.upper():
                    raise SecurityError(f"Обнаружен опасный паттерн: {pattern}")
    
    # Проверка размера данных
    if len(str(input_data)) > 10000:
        raise ValidationError("Размер входных данных превышает лимит")
    
    return True
```

### 2. Ограничения доступа

```python
class SecureTool(BaseTool):
    def __init__(self, allowed_users: List[str] = None):
        super().__init__()
        self.allowed_users = allowed_users or []
    
    def _run(self, *args, **kwargs):
        # Проверка прав доступа
        current_user = self.get_current_user()
        if self.allowed_users and current_user not in self.allowed_users:
            return "Доступ запрещен"
        
        return super()._run(*args, **kwargs)
```

## Узлы инструментов:

* [BraveSearch API](bravesearch-api.md)
* [Калькулятор](calculator.md)
* [Инструмент цепочки](chain-tool.md)
* [Инструмент чат-потока](chatflow-tool.md)
* [Пользовательский инструмент](custom-tool.md)
* [Exa Search](exa-search.md)
* [Gmail](gmail.md)
* [Google Calendar](google-calendar.md)
* [Google Custom Search](google-custom-search.md)
* [Google Drive](google-drive.md)
* [Google Sheets](google-sheets.md)
* [Microsoft Outlook](microsoft-outlook.md)
* [Microsoft Teams](microsoft-teams.md)
* [OpenAPI Toolkit](openapi-toolkit.md)
* [Python Interpreter](python-interpreter.md)
* [Чтение файла](read-file.md)
* [GET запрос](request-get.md)
* [POST запрос](request-post.md)
* [Инструмент ретривера](retriever-tool.md)
* [SearchApi](searchapi.md)
* [SearXNG](searxng.md)
* [Serp API](serp-api.md)
* [Serper](serper.md)
* [Tavily AI](tavily-ai.md)
* [Веб-браузер](web-browser.md)
* [Запись файла](write-file.md)

## Заключение

Инструменты являются ключевым компонентом для создания мощных и функциональных агентов. Правильный выбор, конфигурация и использование инструментов определяют возможности и эффективность ваших AI-систем.

При разработке и использовании инструментов всегда учитывайте:
- **Безопасность** - валидация входных данных и ограничения доступа
- **Производительность** - оптимизация времени выполнения и использования ресурсов
- **Надежность** - обработка ошибок и механизмы восстановления
- **Масштабируемость** - возможность обработки увеличивающейся нагрузки
