---
description: Узнайте, как запрашивать структурированные данные
---

# Вопросы и ответы по SQL

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

В отличие от предыдущих примеров, таких как [Вопросы и ответы по веб-скрапингу](web-scrape-qna.md) и [Вопросы и ответы по множественным документам](multiple-documents-qna.md), запрос структурированных данных не требует векторной базы данных. На высоком уровне это может быть достигнуто следующими шагами:

1. Предоставление LLM:
   * обзора схемы SQL базы данных
   * примеров строк данных
2. Возврат SQL запроса с промптингом few-shot
3. Валидация SQL запроса с использованием узла [Если-Иначе](../integrations/utilities/if-else.md)
4. Создание пользовательской функции для выполнения SQL запроса и получения ответа
5. Возврат естественного ответа из выполненного SQL ответа

<figure><img src="../.gitbook/assets/image (113).png" alt=""><figcaption></figcaption></figure>

В этом примере мы собираемся создать чатбота для вопросов и ответов, который может взаимодействовать с SQL базой данных, хранящейся в SingleStore

<figure><img src="../.gitbook/assets/image (116).png" alt=""><figcaption></figcaption></figure>

## Краткое изложение

Вы можете найти шаблон чат-потока:

{% file src="../.gitbook/assets/SQL Chatflow.json" %}

## 1. Схема SQL базы данных + Примеры строк

Используйте узел пользовательской JS функции для подключения к SingleStore, получения схемы базы данных и топ-3 строк.

Из [исследовательской статьи](https://arxiv.org/abs/2204.00498) рекомендуется генерировать промпт со следующим примером формата:

```
CREATE TABLE samples (firstName varchar NOT NULL, lastName varchar)
SELECT * FROM samples LIMIT 3
firstName lastName
Stephen Tyler
Jack McGinnis
Steven Repici
```

<figure><img src="../.gitbook/assets/image (114).png" alt=""><figcaption></figcaption></figure>

<details>

<summary>Полный код JavaScript</summary>

```javascript
const HOST = 'singlestore-host.com';
const USER = 'admin';
const PASSWORD = 'mypassword';
const DATABASE = 'mydb';
const TABLE = 'samples';
const mysql = require('mysql2/promise');

let sqlSchemaPrompt;

try {
    // Создание подключения к базе данных
    const connection = await mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    // Получение схемы таблицы
    const [schemaRows] = await connection.execute(`DESCRIBE ${TABLE}`);
    
    // Формирование CREATE TABLE statement
    let createTableStatement = `CREATE TABLE ${TABLE} (`;
    const columns = schemaRows.map(row => {
        let columnDef = `${row.Field} ${row.Type}`;
        if (row.Null === 'NO') columnDef += ' NOT NULL';
        if (row.Key === 'PRI') columnDef += ' PRIMARY KEY';
        return columnDef;
    });
    createTableStatement += columns.join(', ') + ')';

    // Получение примеров данных
    const [dataRows] = await connection.execute(`SELECT * FROM ${TABLE} LIMIT 3`);
    
    // Формирование финального промпта
    sqlSchemaPrompt = createTableStatement + '\n';
    sqlSchemaPrompt += `SELECT * FROM ${TABLE} LIMIT 3\n`;
    
    if (dataRows.length > 0) {
        // Добавление заголовков столбцов
        const headers = Object.keys(dataRows[0]);
        sqlSchemaPrompt += headers.join(' ') + '\n';
        
        // Добавление данных строк
        dataRows.forEach(row => {
            const values = headers.map(header => row[header] || '');
            sqlSchemaPrompt += values.join(' ') + '\n';
        });
    }

    await connection.end();
    
} catch (error) {
    console.error('Ошибка при получении схемы SQL:', error);
    sqlSchemaPrompt = 'Ошибка при получении схемы базы данных';
}

return sqlSchemaPrompt;
```

</details>

## 2. Генерация SQL запроса

Используйте узел ChatOpenAI с промптом, который включает:
- Схему базы данных из предыдущего шага
- Инструкции по генерации SQL
- Примеры few-shot для лучшего понимания

### Пример промпта:
```
Вы SQL эксперт. Учитывая входной вопрос, создайте синтаксически корректный SQL запрос для выполнения.

Схема базы данных:
{sqlSchema}

Вопрос: {question}

Верните только SQL запрос без дополнительного текста.
```

## 3. Валидация SQL запроса

Используйте узел [Если-Иначе](../integrations/utilities/if-else.md) для проверки:
- Содержит ли ответ SQL ключевые слова
- Не содержит ли опасных операций (DROP, DELETE без WHERE)
- Правильно ли сформирован запрос

## 4. Выполнение SQL запроса

Создайте еще одну пользовательскую JS функцию для выполнения сгенерированного SQL:

```javascript
const mysql = require('mysql2/promise');

async function executeSQLQuery(sqlQuery) {
    try {
        const connection = await mysql.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE
        });

        const [results] = await connection.execute(sqlQuery);
        await connection.end();
        
        return JSON.stringify(results, null, 2);
    } catch (error) {
        return `Ошибка выполнения SQL: ${error.message}`;
    }
}

return await executeSQLQuery($input);
```

## 5. Формирование естественного ответа

Используйте финальный узел ChatOpenAI для преобразования результатов SQL в естественный язык:

```
Основываясь на следующих результатах SQL запроса, предоставьте естественный и понятный ответ на исходный вопрос пользователя.

Исходный вопрос: {question}
Результаты SQL: {sqlResults}

Ответ:
```

## Лучшие практики

### Безопасность
- Всегда валидируйте SQL запросы
- Используйте подготовленные выражения
- Ограничивайте права доступа к базе данных
- Избегайте выполнения операций изменения данных

### Производительность
- Добавляйте LIMIT к запросам по умолчанию
- Оптимизируйте схему базы данных
- Используйте индексы для часто запрашиваемых столбцов

### Точность
- Предоставляйте качественные примеры в промптах
- Тестируйте с различными типами вопросов
- Регулярно обновляйте примеры схемы

## Заключение

SQL QnA системы позволяют пользователям взаимодействовать с структурированными данными на естественном языке. Правильная реализация требует внимания к безопасности, производительности и точности генерации запросов.
