---
description: Узнайте, как использовать переменные в Flowise
---

# Переменные

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Flowise позволяет пользователям создавать переменные, которые могут использоваться в узлах. Переменные могут быть статическими или динамическими.

## Что такое переменные?

Переменные в Flowise - это именованные значения, которые можно:

- **Переиспользовать** в различных узлах и чат-потоках
- **Централизованно управлять** конфигурацией
- **Динамически изменять** во время выполнения
- **Защищать чувствительные данные** (API ключи, пароли)
- **Настраивать поведение** без изменения логики потока

### Архитектура переменных

```
Определение переменной → Хранение → Использование в узлах → Выполнение
         ↓                ↓            ↓                    ↓
    Тип и значение → База данных → Подстановка → Результат
```

## Типы переменных

### Статические переменные

Статическая переменная будет сохранена с указанным значением и извлечена как есть.

<figure><img src="../.gitbook/assets/image (13) (1) (1) (1) (1) (1).png" alt="" width="542"><figcaption></figcaption></figure>

#### Характеристики статических переменных:

```yaml
static_variables:
  storage: "База данных Flowise"
  persistence: "Постоянное хранение"
  scope: "Глобальное или на уровне чат-потока"
  security: "Видимы в интерфейсе"
  
examples:
  - name: "company_name"
    value: "ООО Технологии Будущего"
    type: "string"
    
  - name: "max_tokens"
    value: "2000"
    type: "number"
    
  - name: "default_language"
    value: "ru"
    type: "string"
```

#### Лучшие практики для статических переменных:

```python
# Примеры хорошего использования статических переменных
static_var_examples = {
    "configuration": {
        "app_name": "Universo Platformo",
        "version": "2.1.0",
        "default_model": "gpt-4",
        "max_retries": 3
    },
    
    "business_logic": {
        "company_name": "ООО Рога и Копыта",
        "support_email": "support@company.com",
        "working_hours": "9:00-18:00 МСК",
        "default_currency": "RUB"
    },
    
    "ui_customization": {
        "theme_color": "#007bff",
        "welcome_message": "Добро пожаловать в наш чатбот!",
        "error_message": "Извините, произошла ошибка. Попробуйте позже."
    }
}
```

### Динамические переменные (Runtime)

Значение переменной будет получено из файла **.env** с использованием `process.env`

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="537"><figcaption></figcaption></figure>

#### Характеристики динамических переменных:

```yaml
runtime_variables:
  storage: "Переменные окружения (.env файл)"
  persistence: "Загружаются при старте приложения"
  scope: "Глобальное на уровне системы"
  security: "Скрыты от интерфейса"
  
examples:
  - name: "OPENAI_API_KEY"
    env_var: "OPENAI_API_KEY"
    type: "secret"
    
  - name: "DATABASE_URL"
    env_var: "DATABASE_URL"
    type: "connection_string"
    
  - name: "REDIS_HOST"
    env_var: "REDIS_HOST"
    type: "hostname"
```

#### Настройка переменных окружения:

```bash
# .env файл
# API ключи
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/flowise
REDIS_URL=redis://localhost:6379

# Конфигурация приложения
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://yourdomain.com

# Внешние сервисы
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Безопасность
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Переопределение переменных через API

Чтобы переопределить значение переменной, пользователь должен явно включить это в правом верхнем углу:

**Настройки** -> **Конфигурация** -> вкладка **Безопасность**:

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

Если существует созданная переменная, значение переменной, предоставленное в API, переопределит существующее значение.

```json
{
    "question": "привет",
    "overrideConfig": {
        "vars": {
            "var": "некоторое-переопределенное-значение"
        }
    }
}
```

### Продвинутые примеры переопределения:

```javascript
// Переопределение нескольких переменных
const apiRequest = {
    "question": "Создай отчет для клиента",
    "overrideConfig": {
        "vars": {
            "client_name": "ООО Новый Клиент",
            "report_type": "quarterly",
            "language": "ru",
            "currency": "RUB",
            "date_format": "DD.MM.YYYY"
        }
    }
};

// Переопределение с валидацией
const secureApiRequest = {
    "question": "Обработай платеж",
    "overrideConfig": {
        "vars": {
            "payment_amount": "1000.00",
            "payment_currency": "RUB",
            "merchant_id": "MERCHANT_123"
        }
    }
};

// Условное переопределение
const conditionalRequest = {
    "question": "Проанализируй данные",
    "overrideConfig": {
        "vars": {
            "analysis_depth": process.env.NODE_ENV === 'production' ? "detailed" : "basic",
            "include_charts": "true",
            "export_format": "pdf"
        }
    }
};
```

## Использование переменных

Переменные могут использоваться узлами в Flowise. Например, создана переменная с именем **`character`**:

<figure><img src="../.gitbook/assets/image (96).png" alt=""><figcaption></figcaption></figure>

Мы можем затем использовать эту переменную как **`$vars.<имя-переменной>`** в функции следующих узлов:

* [Пользовательский инструмент](../integrations/langchain/tools/custom-tool.md)
* [Пользовательская функция](../integrations/utilities/custom-js-function.md)
* [Пользовательский загрузчик](../integrations/langchain/document-loaders/custom-document-loader.md)
* [If Else](../integrations/utilities/if-else.md)
* Custom MCP

<figure><img src="../.gitbook/assets/image (105).png" alt="" width="283"><figcaption></figcaption></figure>

### Использование в JavaScript функциях:

```javascript
// Пример использования переменных в пользовательском инструменте
const apiKey = $vars.openai_api_key;
const companyName = $vars.company_name;
const maxRetries = $vars.max_retries || 3;

// Валидация переменных
if (!apiKey) {
    throw new Error('API ключ не найден в переменных');
}

// Использование в запросе
const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: $vars.default_model || 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `Ты ассистент компании ${companyName}. Отвечай профессионально и дружелюбно.`
            },
            {
                role: 'user', 
                content: $input
            }
        ],
        max_tokens: parseInt($vars.max_tokens) || 1000
    })
});
```

### Использование в текстовых полях

Кроме того, пользователь также может использовать переменную в текстовом вводе любого узла в следующем формате:

**`{{$vars.<имя-переменной>}}`**

Например, в системном сообщении агента:

<figure><img src="../.gitbook/assets/image (1) (1) (1) (2) (1).png" alt="" width="508"><figcaption></figcaption></figure>

В шаблоне промпта:

<figure><img src="../.gitbook/assets/image (157).png" alt=""><figcaption></figcaption></figure>

### Примеры использования в промптах:

```markdown
# Системное сообщение с переменными
Ты ассистент компании {{$vars.company_name}}. 

Твоя роль: {{$vars.assistant_role}}
Стиль общения: {{$vars.communication_style}}
Язык ответов: {{$vars.response_language}}

Рабочие часы поддержки: {{$vars.support_hours}}
Контактный email: {{$vars.support_email}}

Всегда будь {{$vars.personality_traits}} и помогай пользователям решать их вопросы.
```

```markdown
# Промпт для генерации отчетов
Создай {{$vars.report_type}} отчет для клиента {{$vars.client_name}}.

Параметры отчета:
- Период: {{$vars.report_period}}
- Валюта: {{$vars.currency}}
- Формат даты: {{$vars.date_format}}
- Язык: {{$vars.report_language}}

Включи следующие разделы:
{{$vars.report_sections}}

Используй корпоративный стиль компании {{$vars.company_name}}.
```

## Управление переменными

### Организация переменных

```python
# Структура организации переменных
variable_organization = {
    "global": {
        "description": "Глобальные настройки системы",
        "variables": [
            "app_name", "version", "environment", 
            "default_language", "timezone"
        ]
    },
    
    "security": {
        "description": "Ключи и секреты",
        "variables": [
            "openai_api_key", "database_password", 
            "jwt_secret", "encryption_key"
        ],
        "type": "runtime"
    },
    
    "business": {
        "description": "Бизнес-логика",
        "variables": [
            "company_name", "support_email", 
            "working_hours", "default_currency"
        ]
    },
    
    "ui": {
        "description": "Интерфейс пользователя",
        "variables": [
            "theme_color", "welcome_message", 
            "error_message", "logo_url"
        ]
    }
}
```

### Валидация переменных

```javascript
// Система валидации переменных
class VariableValidator {
    static validate(name, value, type) {
        const validators = {
            email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            url: (val) => /^https?:\/\/.+/.test(val),
            number: (val) => !isNaN(parseFloat(val)),
            boolean: (val) => ['true', 'false', '1', '0'].includes(val.toLowerCase()),
            api_key: (val) => val.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(val),
            currency: (val) => /^[A-Z]{3}$/.test(val),
            language: (val) => /^[a-z]{2}(-[A-Z]{2})?$/.test(val)
        };
        
        if (validators[type]) {
            return validators[type](value);
        }
        
        return true; // По умолчанию валидно
    }
    
    static getValidationError(name, value, type) {
        if (!this.validate(name, value, type)) {
            const messages = {
                email: "Неверный формат email адреса",
                url: "URL должен начинаться с http:// или https://",
                number: "Значение должно быть числом",
                boolean: "Значение должно быть true/false или 1/0",
                api_key: "API ключ должен содержать минимум 20 символов",
                currency: "Код валюты должен состоять из 3 заглавных букв",
                language: "Код языка должен быть в формате 'ru' или 'ru-RU'"
            };
            
            return messages[type] || "Неверное значение переменной";
        }
        
        return null;
    }
}
```

### Безопасность переменных

```javascript
// Управление безопасностью переменных
class VariableSecurity {
    static sensitivePatterns = [
        /password/i, /secret/i, /key/i, /token/i,
        /credential/i, /auth/i, /private/i
    ];
    
    static isSensitive(name) {
        return this.sensitivePatterns.some(pattern => pattern.test(name));
    }
    
    static maskValue(value, name) {
        if (this.isSensitive(name)) {
            if (value.length <= 4) {
                return '*'.repeat(value.length);
            }
            return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
        }
        return value;
    }
    
    static encryptSensitive(value, name) {
        if (this.isSensitive(name)) {
            // Здесь должна быть реальная логика шифрования
            return btoa(value); // Простое base64 для примера
        }
        return value;
    }
    
    static auditAccess(variableName, userId, action) {
        const auditLog = {
            timestamp: new Date().toISOString(),
            variable: variableName,
            user: userId,
            action: action, // 'read', 'write', 'delete'
            sensitive: this.isSensitive(variableName)
        };
        
        // Логирование в систему аудита
        console.log('Variable Access:', auditLog);
        return auditLog;
    }
}
```

## Продвинутые техники

### Условные переменные

```javascript
// Условная логика для переменных
const getConditionalVariable = (condition, trueValue, falseValue) => {
    return condition ? trueValue : falseValue;
};

// Использование в промпте
const systemMessage = `
Ты ассистент уровня ${$vars.user_tier === 'premium' ? 'эксперт' : 'базовый'}.
${$vars.user_tier === 'premium' ? 
    'У тебя есть доступ ко всем функциям и данным.' : 
    'Ты можешь отвечать только на базовые вопросы.'
}
`;
```

### Переменные с вычислениями

```javascript
// Вычисляемые переменные
const computedVariables = {
    current_date: () => new Date().toISOString().split('T')[0],
    current_time: () => new Date().toLocaleTimeString('ru-RU'),
    user_greeting: (userName) => `Добро пожаловать, ${userName}!`,
    formatted_price: (price, currency) => new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency || 'RUB'
    }).format(price)
};
```

### Переменные с внешними источниками

```javascript
// Загрузка переменных из внешних источников
class ExternalVariableLoader {
    static async loadFromAPI(endpoint, apiKey) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка загрузки переменных:', error);
            return {};
        }
    }
    
    static async loadFromDatabase(query) {
        // Логика загрузки из базы данных
        // Возвращает объект с переменными
    }
    
    static async loadFromFile(filePath) {
        // Логика загрузки из файла
        // Поддержка JSON, YAML, CSV форматов
    }
}
```

## Ресурсы

* [Передача переменных в функцию](../integrations/langchain/tools/custom-tool.md#pass-variables-to-function)

## Заключение

Переменные в Flowise предоставляют мощный механизм для создания гибких и настраиваемых чат-потоков. Правильное использование статических и динамических переменных, а также их безопасное управление, позволяет создавать масштабируемые и поддерживаемые решения.

Ключевые принципы работы с переменными:
- **Используйте статические переменные** для конфигурации и бизнес-логики
- **Используйте динамические переменные** для секретов и системных настроек
- **Валидируйте значения** переменных перед использованием
- **Обеспечивайте безопасность** чувствительных данных
- **Документируйте назначение** каждой переменной
- **Организуйте переменные** по категориям и областям применения
