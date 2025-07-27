# SQL Агент

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Это руководство проведет вас через создание интеллектуального SQL агента, который может взаимодействовать с базами данных, генерировать SQL запросы, проверять их, выполнять и самостоятельно исправлять ошибки.

## Обзор

Поток SQL агента реализует надежную систему взаимодействия с базой данных, которая:

1. Извлекает информацию о схеме базы данных
2. Генерирует SQL запросы на основе вопросов пользователя
3. Проверяет сгенерированные запросы на распространенные ошибки
4. Выполняет запросы к базе данных
5. Проверяет результаты на ошибки и самостоятельно исправляет их при необходимости
6. Предоставляет ответы на естественном языке на основе результатов запроса

<figure><img src="../.gitbook/assets/image (5) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

### Шаг 1: Настройка начального узла

Начните с добавления узла **Старт** на ваш холст. Он служит точкой входа для вашего SQL агента.

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Тип ввода**: Выберите "Ввод чата" для принятия вопросов пользователя
* **Состояние потока**: Добавьте переменную состояния с ключом "`sqlQuery`" и пустым значением

Узел Старт инициализирует состояние потока с пустой переменной `sqlQuery`, которая будет хранить сгенерированный SQL запрос на протяжении всего процесса.

### Шаг 2: Извлечение схемы базы данных

Добавьте узел **Пользовательская функция** и подключите его к узлу Старт.

<figure><img src="../.gitbook/assets/image (3) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Javascript функция**: Это пример функции, которая подключается к вашей базе данных и извлекает полную схему, включая структуры таблиц, определения столбцов и примеры данных.

```javascript
const { DataSource } = require('typeorm');

const HOST = 'localhost';
const USER = 'testuser';
const PASSWORD = 'testpwd';
const DATABASE = 'testdatabase';
const PORT = 5432;

let sqlSchemaPrompt = '';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT,
  username: USER,
  password: PASSWORD,
  database: DATABASE,
  synchronize: false,
  logging: false,
});

async function getSQLPrompt() {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    // Получить все пользовательские таблицы
    const tablesResult = await queryRunner.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    for (const tableRow of tablesResult) {
      const tableName = tableRow.table_name;
      const schemaInfo = await queryRunner.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
      `);

      const createColumns = [];
      const columnNames = [];

      for (const column of schemaInfo) {
        const name = column.column_name;
        const type = column.data_type.toUpperCase();
        const notNull = column.is_nullable === 'NO' ? 'NOT NULL' : '';
        columnNames.push(name);
        createColumns.push(`${name} ${type} ${notNull}`);
      }

      const sqlCreateTableQuery = `CREATE TABLE ${tableName} (${createColumns.join(', ')})`;
      const sqlSelectTableQuery = `SELECT * FROM ${tableName} LIMIT 3`;

      let allValues = [];
      try {
        const rows = await queryRunner.query(sqlSelectTableQuery);
        allValues = rows.map(row =>
          columnNames.map(col => row[col]).join(' ')
        );
      } catch (err) {
        allValues.push('[ОШИБКА ПОЛУЧЕНИЯ СТРОК]');
      }

      sqlSchemaPrompt +=
        sqlCreateTableQuery + '\n' +
        sqlSelectTableQuery + '\n' +
        columnNames.join(' ') + '\n' +
        allValues.join('\n') + '\n\n';
    }

    await queryRunner.release();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

await getSQLPrompt();
return sqlSchemaPrompt;
```

### Шаг 3: Генерация SQL запросов

Добавьте узел **LLM**, подключенный к узлу "Получить схему БД".

<figure><img src="../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Сообщения**: Добавьте системное сообщение:

```
Вы агент, предназначенный для взаимодействия с SQL базой данных. Получив входной вопрос, создайте синтаксически корректный sqlite запрос для выполнения, затем посмотрите на результаты запроса и верните ответ. Если пользователь не указывает конкретное количество примеров, которые он хочет получить, всегда ограничивайте ваш запрос максимум 5 результатами. Вы можете упорядочить результаты по релевантному столбцу, чтобы вернуть наиболее интересные примеры в базе данных. Никогда не запрашивайте все столбцы из конкретной таблицы, запрашивайте только релевантные столбцы для данного вопроса. НЕ делайте никаких DML операций (INSERT, UPDATE, DELETE, DROP и т.д.) к базе данных.

Вот релевантная информация о таблице:
{{ customFunctionAgentflow_0 }}

Примечание:
- Генерируйте только ОДИН SQL запрос
```

* **JSON структурированный вывод**: Здесь мы инструктируем модель возвращать только структурированный вывод, чтобы предотвратить включение LLM другого текста кроме SQL запроса.
  * Ключ: "`sql_query`"
  * Тип: "string"
  * Описание: "SQL запрос"
* **Обновить состояние потока**: Установите ключ "`sqlQuery`" со значением `{{ output.sql_query }}`

Этот узел преобразует вопрос пользователя на естественном языке в структурированный SQL запрос, используя информацию о схеме базы данных.

### Шаг 4: Проверка синтаксиса SQL запроса

Добавьте узел **Агент условий**, подключенный к LLM "Генерировать SQL запрос".

<figure><img src="../.gitbook/assets/image (5) (1) (1) (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Инструкции**:

```
Вы эксперт по SQL с сильным вниманием к деталям. Дважды проверьте SQL запрос на распространенные ошибки, включая:
- Использование NOT IN с NULL значениями
- Использование UNION когда должен был использоваться UNION ALL
- Использование BETWEEN для исключающих диапазонов
- Несоответствие типов данных в предикатах
- Правильное цитирование идентификаторов
- Использование правильного количества аргументов для функций
- Приведение к правильному типу данных
- Использование правильных столбцов для соединений
```

* **Ввод**: `{{ $flow.state.sqlQuery }}`
* **Сценарии**:
  * Сценарий 1: "SQL запрос корректен и не содержит ошибок"
  * Сценарий 2: "SQL запрос содержит ошибки"

Этот шаг проверки выявляет распространенные SQL ошибки перед выполнением.

### Шаг 5: Обработка регенерации запроса (путь ошибки)

Для некорректных запросов (выход 1) из предыдущего узла Агент условий, добавьте узел **Цикл**.

<figure><img src="../.gitbook/assets/image (6) (1) (1) (1) (1).png" alt="" width="375"><figcaption></figcaption></figure>

#### Конфигурация:

<figure><img src="../.gitbook/assets/image (7) (1) (1) (1) (1).png" alt="" width="526"><figcaption></figcaption></figure>

* **Вернуться к**: "Генерировать SQL запрос"
* **Максимальное количество циклов**: Установите 5

Это создает цикл обратной связи, который позволяет системе повторить генерацию запроса при неудачной проверке.

### Шаг 6: Выполнение валидных SQL запросов

Для корректных запросов (выход 0), добавьте узел **Пользовательская функция**.

<figure><img src="../.gitbook/assets/image (8) (1) (1) (1).png" alt="" width="375"><figcaption></figcaption></figure>

#### Конфигурация:

<figure><img src="../.gitbook/assets/image (9) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

* **Входные переменные**: Здесь мы передаем сгенерированный SQL запрос как переменную для использования в функции.
  * Имя переменной: "sqlQuery"
  * Значение переменной: `{{ $flow.state.sqlQuery }}`
* **Javascript функция**: Эта функция выполняет проверенный SQL запрос к базе данных и форматирует результаты.

```javascript
const { DataSource } = require('typeorm');

const HOST = 'localhost';
const USER = 'testuser';
const PASSWORD = 'testpwd';
const DATABASE = 'testdatabase';
const PORT = 5432;

const sqlQuery = $sqlQuery;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT,
  username: USER,
  password: PASSWORD,
  database: DATABASE,
  synchronize: false,
  logging: false,
});

let formattedResult = '';

async function runSQLQuery(query) {
  try {
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    const rows = await queryRunner.query(query);
    console.log('rows =', rows);

    if (rows.length === 0) {
      formattedResult = '[Результаты не возвращены]';
    } else {
      const columnNames = Object.keys(rows[0]);
      const header = columnNames.join(' ');
      const values = rows.map(row =>
        columnNames.map(col => row[col]).join(' ')
      );

      formattedResult = query + '\n' + header + '\n' + values.join('\n');
    }

    await queryRunner.release();
  } catch (err) {
    console.error('[ОШИБКА]', err);
    formattedResult = `[Ошибка выполнения запроса]: ${err}`;
  }

  return formattedResult;
}

await runSQLQuery(sqlQuery);
return formattedResult;
```

### Шаг 7: Проверка результатов выполнения запроса

Добавьте узел **Агент условий**, подключенный к функции "Выполнить SQL запрос".

<figure><img src="../.gitbook/assets/image (10) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Инструкции**: "Вы эксперт по SQL. Проверьте, корректен ли результат запроса или содержит ошибку."
* **Ввод**: `{{ customFunctionAgentflow_1 }}`
* **Сценарии**:
  * Сценарий 1: "Результат корректен и не содержит ошибки"
  * Сценарий 2: "Результат запроса содержит ошибку"

Этот шаг проверяет результаты выполнения и определяет, нужна ли дальнейшая коррекция.

### Шаг 8: Генерация финального ответа (путь успеха)

Для успешных результатов (выход 0 от Агента условий), добавьте узел **LLM**.

<figure><img src="../.gitbook/assets/image (11) (1) (1) (1).png" alt="" width="375"><figcaption></figcaption></figure>

#### Конфигурация:

* **Входное сообщение**: `{{ customFunctionAgentflow_1 }}`

Этот узел генерирует ответ на естественном языке на основе успешных результатов запроса.

### Шаг 9: Обработка регенерации запроса (путь ошибки времени выполнения)

Для неудачных выполнений (выход 1 от Агента условий), добавьте узел **LLM**.

<figure><img src="../.gitbook/assets/image (12) (1) (1) (1).png" alt="" width="375"><figcaption></figcaption></figure>

#### Конфигурация:

<figure><img src="../.gitbook/assets/image (13) (1) (1) (1).png" alt="" width="399"><figcaption></figcaption></figure>

* **Сообщения**: Добавьте то же системное сообщение, что и в Шаге 3
* **Входное сообщение**:

```
Учитывая сгенерированный SQL запрос: {{ $flow.state.sqlQuery }}
У меня следующая ошибка: {{ customFunctionAgentflow_1 }}
Регенерируйте новый SQL запрос, который исправит ошибку
```

* **JSON структурированный вывод**: То же, что и в Шаге 3
* **Обновить состояние потока**: Установите ключ "`sqlQuery`" со значением `{{ output.sql_query }}`

Этот узел анализирует ошибки времени выполнения и генерирует исправленные SQL запросы.

### Шаг 10: Добавление второго цикла назад

Добавьте узел **Цикл**, подключенный к LLM "Регенерировать SQL запрос".

<figure><img src="../.gitbook/assets/image (14) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

#### Конфигурация:

* **Вернуться к**: "Проверить SQL запрос"
* **Максимальное количество циклов**: Установите 5

Это создает второй цикл обратной связи для исправления ошибок времени выполнения.

***

## Полная структура потока

{% file src="../.gitbook/assets/SQL Agent.json" %}

***

## Резюме

1. Старт → Получить схему БД
2. Получить схему БД → Генерировать SQL запрос
3. Генерировать SQL запрос → Проверить SQL запрос
4. Проверить SQL запрос (Корректно) → Выполнить SQL запрос
5. Проверить SQL запрос (Некорректно) → Регенерировать запрос (Цикл назад)
6. Выполнить SQL запрос → Проверить результат
7. Проверить результат (Успех) → Вернуть ответ
8. Проверить результат (Ошибка) → Регенерировать SQL запрос
9. Регенерировать SQL запрос → Перепроверить SQL запрос (Цикл назад)

***

## Тестирование вашего SQL агента

Протестируйте вашего агента с различными типами вопросов к базе данных:

* Простые запросы: "Покажите мне всех клиентов"
* Сложные запросы: "Какие топ-5 продуктов по продажам?"
* Аналитические запросы: "Рассчитайте среднюю стоимость заказа по месяцам"

<figure><img src="../.gitbook/assets/image (15) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

Этот поток SQL агента предоставляет надежную, самокорректирующуюся систему для взаимодействия с базой данных, которая может обрабатывать SQL запросы на естественном языке.
