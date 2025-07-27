# Взаимодействие с API

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Почти все веб-приложения полагаются на RESTful API. Предоставление LLM возможности взаимодействовать с ними расширяет его практическую полезность.

Это руководство демонстрирует, как LLM может использоваться для выполнения API вызовов через вызов инструментов.

## Предварительные требования - Пример сервера управления мероприятиями

Мы собираемся использовать простой сервер управления мероприятиями и продемонстрировать, как взаимодействовать с ним.

```javascript
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5566;

// Middleware
app.use(express.json());

// Фальшивая база данных - хранение в памяти
let events = [
  {
    id: '1',
    name: 'Технологическая конференция 2024',
    date: '2024-06-15T09:00:00Z',
    location: 'Сан-Франциско, Калифорния'
  },
  {
    id: '2',
    name: 'Музыкальный фестиваль',
    date: '2024-07-20T18:00:00Z',
    location: 'Остин, Техас'
  },
  {
    id: '3',
    name: 'Открытие художественной выставки',
    date: '2024-05-10T14:00:00Z',
    location: 'Нью-Йорк, Нью-Йорк'
  },
  {
    id: '4',
    name: 'Сетевое мероприятие стартапов',
    date: '2024-08-05T17:30:00Z',
    location: 'Сиэтл, Вашингтон'
  },
  {
    id: '5',
    name: 'Дегустация еды и вина',
    date: '2024-09-12T19:00:00Z',
    location: 'Долина Напа, Калифорния'
  }
];

// Вспомогательная функция для проверки данных мероприятия
const validateEvent = (eventData) => {
  const required = ['name', 'date', 'location'];
  const missing = required.filter(field => !eventData[field]);
  
  if (missing.length > 0) {
    return { valid: false, message: `Отсутствуют обязательные поля: ${missing.join(', ')}` };
  }
  
  // Базовая проверка даты
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!dateRegex.test(eventData.date)) {
    return { valid: false, message: 'Дата должна быть в формате ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)' };
  }
  
  return { valid: true };
};

// GET /events - Список всех мероприятий
app.get('/events', (req, res) => {
  res.status(200).json(events);
});

// POST /events - Создать новое мероприятие
app.post('/events', (req, res) => {
  const validation = validateEvent(req.body);
  
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }
  
  const newEvent = {
    id: req.body.id || uuidv4(),
    name: req.body.name,
    date: req.body.date,
    location: req.body.location
  };
  
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// GET /events/{id} - Получить мероприятие по ID
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  
  if (!event) {
    return res.status(404).json({ error: 'Мероприятие не найдено' });
  }
  
  res.status(200).json(event);
});

// DELETE /events/{id} - Удалить мероприятие по ID
app.delete('/events/:id', (req, res) => {
  const eventIndex = events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Мероприятие не найдено' });
  }
  
  events.splice(eventIndex, 1);
  res.status(204).send();
});

// PATCH /events/{id} - Обновить детали мероприятия по ID
app.patch('/events/:id', (req, res) => {
  const eventIndex = events.findIndex(e => e.id === req.params.id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Мероприятие не найдено' });
  }
  
  const validation = validateEvent(req.body);
  
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }
  
  // Обновить мероприятие
  events[eventIndex] = {
    ...events[eventIndex],
    name: req.body.name,
    date: req.body.date,
    location: req.body.location
  };
  
  res.status(200).json(events[eventIndex]);
});

// Middleware обработки ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ error: 'Конечная точка не найдена' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер API управления мероприятиями запущен на порту ${PORT}`);
  console.log(`Доступные конечные точки:`);
  console.log(`  GET    /events      - Список всех мероприятий`);
  console.log(`  POST   /events      - Создать новое мероприятие`);
  console.log(`  GET    /events/{id} - Получить мероприятие по ID`);
  console.log(`  PATCH  /events/{id} - Обновить мероприятие по ID`);
  console.log(`  DELETE /events/{id} - Удалить мероприятие по ID`);
});

module.exports = app; 
```

***

## Инструменты запросов

Есть 4 инструмента запросов, которые можно использовать. Это позволяет LLM вызывать инструменты GET, POST, PUT, DELETE при необходимости.

### Шаг 1: Добавить узел Старт

Узел Старт является точкой входа вашего потока

<figure><img src="../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="324"><figcaption></figcaption></figure>

### Шаг 2: Добавить узел Агент

Далее добавьте узел Агент. В этой настройке агент настроен с четырьмя основными инструментами: GET, POST, PUT и DELETE. Каждый инструмент настроен для выполнения определенного типа API запроса.

#### Инструмент 1: GET (Получение мероприятий)

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="335"><figcaption></figcaption></figure>

* **Цель:** Получить список мероприятий или конкретное мероприятие из API.
* **Входы конфигурации:**
  * **URL:** `http://localhost:5566/events`
  * **Название:** `get_events`
  * **Описание:** Опишите, когда использовать этот инструмент. Например: `Используйте это, когда вам нужно получить мероприятия`
  * **Заголовки:** (Опционально) Добавьте любые необходимые HTTP заголовки.
  *   **Схема параметров запроса:** JSON схема API, которая позволяет LLM знать о структуре URL, какие параметры пути и запроса генерировать. Например:

      ```json
      {
        "id": {
          "type": "string",
          "in": "path",
          "description": "ID элемента для получения. /:id"
        },
        "limit": {
          "type": "string",
          "in": "query",
          "description": "Ограничить количество элементов для получения. ?limit=10"
        }
      }
      ```

#### Инструмент 2: POST (Создание мероприятия)

<figure><img src="../.gitbook/assets/image (2) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="335"><figcaption></figcaption></figure>

* **Цель:** Создать новое мероприятие в системе.
* **Входы конфигурации:**
  * **URL:** `http://localhost:5566/events`
  * **Название:** `create_event`
  * **Описание:** `Используйте это, когда хотите создать новое мероприятие.`
  * **Заголовки:** (Опционально) Добавьте любые необходимые HTTP заголовки.
  * **Тело**: Жестко закодированный объект тела, который переопределит тело, сгенерированное LLM
  *   **Схема тела:** JSON схема тела API запроса, которая позволяет LLM знать, как автоматически генерировать правильное JSON тело. Например:

      ```json
      {
        "name": {
          "type": "string",
          "required": true,
          "description": "Название мероприятия"
        },
        "date": {
          "type": "string",
          "required": true,
          "description": "Дата мероприятия"
        },
        "location": {
          "type": "string",
          "required": true,
          "description": "Место проведения мероприятия"
        }
      }
      ```

#### Инструмент 3: PUT (Обновление мероприятия)

<figure><img src="../.gitbook/assets/image (3) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="335"><figcaption></figcaption></figure>

* **Цель:** Обновить детали существующего мероприятия.
* **Входы конфигурации:**
  * **URL:** `http://localhost:5566/events`
  * **Название:** `update_event`
  * **Описание:** `Используйте это, когда хотите обновить мероприятие.`
  * **Заголовки:** (Опционально) Добавьте любые необходимые HTTP заголовки.
  * **Тело**: Жестко закодированный объект тела, который переопределит тело, сгенерированное LLM
  *   **Схема тела:** JSON схема тела API запроса, которая позволяет LLM знать, как автоматически генерировать правильное JSON тело. Например:

      ```json
      {
        "name": {
          "type": "string",
          "required": true,
          "description": "Название мероприятия"
        },
        "date": {
          "type": "string",
          "required": true,
          "description": "Дата мероприятия"
        },
        "location": {
          "type": "string",
          "required": true,
          "description": "Место проведения мероприятия"
        }
      }
      ```

#### Инструмент 4: DELETE (Удаление мероприятия)

<figure><img src="../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="335"><figcaption></figcaption></figure>

* **Цель:** Удалить мероприятие из системы.
* **Входы конфигурации:**
  * **URL:** `http://localhost:5566/events`
  * **Название:** `delete_event`
  * **Описание:** `Используйте это, когда нужно удалить мероприятие.`
  * **Заголовки:** (Опционально) Добавьте любые необходимые HTTP заголовки.
  *   **Схема параметров запроса:** JSON схема API, которая позволяет LLM знать о структуре URL, какие параметры пути и запроса генерировать. Например:

      ```json
      {
        "id": {
          "type": "string",
          "required": true,
          "in": "path",
          "description": "ID элемента для удаления. /:id"
        }
      }
      ```

### Как агент использует эти инструменты

* Агент может динамически выбирать, какой инструмент использовать, основываясь на запросе пользователя или логике потока.
* Каждый инструмент сопоставлен с конкретным HTTP методом и конечной точкой, с четко определенными входными схемами.
* Агент использует LLM для интерпретации пользовательского ввода, заполнения необходимых параметров и выполнения соответствующего API вызова.

### Примеры взаимодействий

#### 1. Получение мероприятий (GET)

**Пример запроса:**

> "Покажите мне все предстоящие мероприятия."

**Ожидаемое поведение:**

* Агент выбирает инструмент **GET**.
* Он отправляет GET запрос на `http://localhost:5566/events`.
* Агент возвращает список всех мероприятий пользователю.

***

**Пример запроса:**

> "Получите детали мероприятия с ID 12345."

**Ожидаемое поведение:**

* Агент выбирает инструмент **GET**.
* Он отправляет GET запрос на `http://localhost:5566/events/12345`.
* Агент возвращает детали мероприятия с ID `12345`.

***

#### 2. Создание нового мероприятия (POST)

**Пример запроса:**

> "Создайте новое мероприятие под названием 'AI Конференция' на 2024-07-15 в Техническом зале."

**Ожидаемое поведение:**

* Агент выбирает инструмент **POST**.
*   Он отправляет POST запрос на `http://localhost:5566/events` с телом:

    ```json
    {
      "name": "AI Конференция",
      "date": "2024-07-15",
      "location": "Технический зал"
    }
    ```
* Агент подтверждает, что мероприятие было создано, и может вернуть детали нового мероприятия.

***

#### 3. Обновление мероприятия (PUT)

**Пример запроса:**

> "Измените место проведения мероприятия 'AI Конференция' на 2024-07-15 на 'Главный аудиторий'."

**Ожидаемое поведение:**

* Агент выбирает инструмент **PUT**.
*   Он отправляет PUT запрос на `http://localhost:5566/events` с обновленными деталями мероприятия:

    ```json
    {
      "name": "AI Конференция",
      "date": "2024-07-15",
      "location": "Главный аудиторий"
    }
    ```
* Агент подтверждает, что мероприятие было обновлено.

***

#### 4. Удаление мероприятия (DELETE)

**Пример запроса:**

> "Удалите мероприятие с ID 12345."

**Ожидаемое поведение:**

* Агент выбирает инструмент **DELETE**.
* Он отправляет DELETE запрос на `http://localhost:5566/events/12345`.
* Агент подтверждает, что мероприятие было удалено.

### Полный поток

{% file src="../.gitbook/assets/Requests Tool Agent.json" %}

***

## OpenAPI Toolkit

4 инструмента запросов отлично работают, если у вас есть несколько API, но представьте, что у вас десятки или сотни API - это может стать трудно поддерживать. Для решения этой проблемы Flowise предоставляет OpenAPI toolkit, который может принимать OpenAPI YAML файл и разбирать каждый API в инструмент. [Спецификация OpenAPI (OAS)](https://swagger.io/specification/) является универсально принятым стандартом для описания деталей RESTful API в формате, который машины могут читать и интерпретировать.

Используя API управления мероприятиями, мы можем сгенерировать OpenAPI YAML файл:

```yaml
openapi: 3.0.0
info:
  version: 1.0.0
  title: API управления мероприятиями
  description: API для управления данными мероприятий

servers:
  - url: http://localhost:5566
    description: Локальный сервер разработки

paths:
  /events:
    get:
      summary: Список всех мероприятий
      operationId: listEvents
      responses:
        '200':
          description: Список мероприятий
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Event'

    post:
      summary: Создать новое мероприятие
      operationId: createEvent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EventInput'
      responses:
        '201':
          description: Мероприятие было создано
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '400':
          description: Неверный ввод
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /events/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
        description: ID мероприятия

    get:
      summary: Получить мероприятие по ID
      operationId: getEventById
      responses:
        '200':
          description: Мероприятие
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '404':
          description: Мероприятие не найдено
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    patch:
      summary: Обновить детали мероприятия по ID
      operationId: updateEventDetails
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EventInput'
      responses:
        '200':
          description: Детали мероприятия были обновлены
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Event'
        '400':
          description: Неверный ввод
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Мероприятие не найдено
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      summary: Удалить мероприятие по ID
      operationId: deleteEvent
      responses:
        '204':
          description: Мероприятие было удалено
        '404':
          description: Мероприятие не найдено
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  schemas:
    Event:
      type: object
      properties:
        id:
          type: string
          description: Уникальный идентификатор мероприятия
        name:
          type: string
          description: Название мероприятия
        date:
          type: string
          format: date-time
          description: Дата и время мероприятия в формате ISO 8601
        location:
          type: string
          description: Место проведения мероприятия
      required:
        - name
        - date
        - location

    EventInput:
      type: object
      properties:
        name:
          type: string
          description: Название мероприятия
        date:
          type: string
          format: date-time
          description: Дата и время мероприятия в формате ISO 8601
        location:
          type: string
          description: Место проведения мероприятия
      required:
        - name
        - date
        - location

    Error:
      type: object
      properties:
        error:
          type: string
          description: Сообщение об ошибке
```

### Шаг 1: Добавить узел Старт

<figure><img src="../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1).png" alt="" width="319"><figcaption></figcaption></figure>

### Шаг 2: Добавить узел Агент

Далее добавьте узел Агент. В этой настройке агент настроен только с 1 инструментом - OpenAPI Toolkit

#### Инструмент: OpenAPI Toolkit

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="332"><figcaption></figcaption></figure>

* **Цель:** Получить список API из YAML файла и превратить каждый API в список инструментов
* **Входы конфигурации:**
  * **YAML файл:** OpenAPI YAML файл
  * **Возвращать напрямую:** Возвращать ли ответ от API напрямую
  * **Заголовки:** (Опционально) Добавьте любые необходимые HTTP заголовки.
  * **Удалить null параметры:** Удалить все ключи с null значениями из разобранных аргументов
  * **Пользовательский код**: Настроить, как возвращается ответ

### Примеры взаимодействий:

Мы можем использовать те же примеры запросов из предыдущего примера для тестирования:

<figure><img src="../.gitbook/assets/image (2) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

***

## Последовательный вызов API

Из примеров выше мы видели, как Агент может динамически вызывать инструменты и взаимодействовать с API. В некоторых случаях может быть необходимо вызывать API последовательно до или после определенных действий. Например, вы можете получить список клиентов из CRM и передать его Агенту. В таких случаях вы можете использовать [HTTP узел](../using-flowise/agentflowv2.md#id-6.-http-node).

<figure><img src="../.gitbook/assets/image (3) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

## Лучшие практики

* Взаимодействие с API обычно используется, когда вы хотите, чтобы агент получал самую актуальную информацию. Например, агент может получить доступность вашего календаря, статус проекта или другие данные в реальном времени.
* Часто полезно явно включать текущее время в системный промпт. Flowise предоставляет переменную `{{current_date_time}}`, которая получает текущую дату и время. Это позволяет LLM знать о настоящем моменте, поэтому если вы спрашиваете о своей доступности на сегодня, модель может ссылаться на правильную дату. В противном случае она может полагаться на дату последнего обучения, что вернет устаревшую информацию. Например:

```
Вы полезный ассистент.

Сегодняшняя дата и время: {{current_date_time }}
```
