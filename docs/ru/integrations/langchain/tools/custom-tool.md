# Пользовательский инструмент

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Посмотрите, как использовать пользовательские инструменты

{% embed url="https://youtu.be/HSp9LkkTVY0" %}

## Проблема

Функции обычно принимают структурированные входные данные. Допустим, вы хотите, чтобы LLM мог вызывать API [создания записи Airtable](https://airtable.com/developers/web/api/create-records), параметры тела должны быть структурированы определенным образом. Например:

```json
"records": [
  {
    "fields": {
      "Address": "некоторый адрес",
      "Name": "некоторое имя", 
      "Visited": true
    }
  }
]
```

В идеале мы хотим, чтобы LLM возвращал правильно структурированные данные вот так:

```json
{
  "Address": "некоторый адрес",
  "Name": "некоторое имя",
  "Visited": true
}
```

Чтобы мы могли извлечь значение и разобрать его в тело, необходимое для API. Однако инструктировать LLM выводить точный паттерн сложно.

С новыми моделями [OpenAI Function Calling](https://openai.com/blog/function-calling-and-other-api-updates) это теперь возможно. `gpt-4-0613` и `gpt-3.5-turbo-0613` специально обучены возвращать структурированные данные. Модель будет интеллектуально выбирать вывод JSON объекта, содержащего аргументы для вызова этих функций.

## Учебник

**Цель**: Заставить агента автоматически получать движение цены акций, извлекать связанные новости об акциях и добавлять новую запись в Airtable.

Давайте начнем 🚀

### Создание инструментов

Нам нужно 3 инструмента для достижения цели:

* Получить движение цены акций
* Получить новости об акциях  
* Добавить запись в Airtable

#### Получить движение цены акций

Создайте новый инструмент со следующими деталями (вы можете изменить по желанию):

* Название: get_stock_movers
* Описание: Получить акции с наибольшими движениями цены/объема, например, активные, растущие, падающие и т.д.

Описание - важная часть, поскольку ChatGPT полагается на это, чтобы решить, когда использовать этот инструмент.

<figure><img src="../../../.gitbook/assets/image (6) (3).png" alt=""><figcaption></figcaption></figure>

* JavaScript функция: Мы будем использовать API [Morning Star](https://rapidapi.com/apidojo/api/morning-star) `/market/v2/get-movers` для получения данных. Сначала вы должны нажать Subscribe to Test, если еще не сделали этого, затем скопировать код и вставить его в JavaScript функцию.
  * Добавьте `const fetch = require('node-fetch');` в начало для импорта библиотеки. Вы можете импортировать любые встроенные [модули](https://www.w3schools.com/nodejs/ref_modules.asp) NodeJS и [внешние библиотеки](https://github.com/FlowiseAI/Flowise/blob/main/packages/components/src/utils.ts#L289).
  * Верните `result` в конце.

<figure><img src="../../../.gitbook/assets/Untitled (4) (1).png" alt=""><figcaption></figcaption></figure>

Финальный код должен быть:

```javascript
const fetch = require('node-fetch');
const url = 'https://morning-star.p.rapidapi.com/market/v2/get-movers';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'замените на ваш api ключ',
		'X-RapidAPI-Host': 'morning-star.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
	return result;
} catch (error) {
	console.error(error);
	return '';
}
```

Теперь вы можете сохранить его.

#### Получить новости об акциях

Создайте новый инструмент со следующими деталями (вы можете изменить по желанию):

* Название: get_stock_news
* Описание: Получить последние новости для акции
* Схема ввода:
  * Свойство: performanceId
  * Тип: string
  * Описание: id акции, который называется performanceID в API
  * Обязательно: true

Схема ввода сообщает LLM, что возвращать как JSON объект. В этом случае мы ожидаем JSON объект как показано ниже:

```json
{ "performanceId": "НЕКОТОРЫЙ ТИКЕР" }
```

<figure><img src="../../../.gitbook/assets/image (4) (2).png" alt=""><figcaption></figcaption></figure>

* JavaScript функция: Мы будем использовать API [Morning Star](https://rapidapi.com/apidojo/api/morning-star) `/news/list` для получения данных. Сначала вы должны нажать Subscribe to Test, если еще не сделали этого, затем скопировать код и вставить его в JavaScript функцию.
  * Добавьте `const fetch = require('node-fetch');` в начало для импорта библиотеки. Вы можете импортировать любые встроенные [модули](https://www.w3schools.com/nodejs/ref_modules.asp) NodeJS и [внешние библиотеки](https://github.com/FlowiseAI/Flowise/blob/main/packages/components/src/utils.ts#L289).
  * Верните `result` в конце.
* Далее замените жестко закодированный параметр запроса url performanceId: `0P0000OQN8` на переменную свойства, указанную в схеме ввода: `$performanceId`
* Вы можете использовать любые свойства, указанные в схеме ввода, как переменные в JavaScript функции, добавив префикс `$` в начало имени переменной.

<figure><img src="../../../.gitbook/assets/Untitled (2) (1) (1).png" alt=""><figcaption></figcaption></figure>

Финальный код:

```javascript
const fetch = require('node-fetch');
const url = 'https://morning-star.p.rapidapi.com/news/list?performanceId=' + $performanceId;
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'замените на ваш api ключ',
		'X-RapidAPI-Host': 'morning-star.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
	return result;
} catch (error) {
	console.error(error);
	return '';
}
```

Теперь вы можете сохранить его.

#### Добавить запись в Airtable

Создайте новый инструмент со следующими деталями (вы можете изменить по желанию):

* Название: add_airtable
* Описание: Добавить акцию, сводку новостей и движение цены в Airtable
* Схема ввода:
  * Свойство: stock
  * Тип: string
  * Описание: тикер акции
  * Обязательно: true
  * Свойство: move
  * Тип: string
  * Описание: движение цены в %
  * Обязательно: true
  * Свойство: news_summary
  * Тип: string
  * Описание: сводка новостей об акции
  * Обязательно: true

ChatGPT вернет JSON объект вот так:

```json
{ "stock": "НЕКОТОРЫЙ ТИКЕР", "move": "20%", "news_summary": "Некоторая сводка" }
```

<figure><img src="../../../.gitbook/assets/image (36).png" alt=""><figcaption></figcaption></figure>

* JavaScript функция: Мы будем использовать [API создания записи Airtable](https://airtable.com/developers/web/api/create-records) для создания новой записи в существующей таблице. Вы можете найти tableId и baseId [здесь](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/). Вам также нужно создать персональный токен доступа, найдите как это сделать [здесь](https://www.highviewapps.com/kb/how-do-i-create-an-airtable-personal-access-token/).

Финальный код должен выглядеть как показано ниже. Обратите внимание, как мы передаем `$stock`, `$move` и `$news_summary` как переменные:

```javascript
const fetch = require('node-fetch');
const baseId = 'ваш-base-id';
const tableId = 'ваш-table-id';
const token = 'ваш-токен';

const body = {
	"records": [
		{
			"fields": {
				"stock": $stock,
				"move": $move,
				"news_summary": $news_summary,
			}
		}
	]
};

const options = {
	method: 'POST',
	headers: {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(body)
};

const url = `https://api.airtable.com/v0/${baseId}/${tableId}`

try {
	const response = await fetch(url, options);
	const text = await response.text();
	return text;
} catch (error) {
	console.error(error);
	return '';
}
```

Теперь вы можете сохранить его.

Вы должны увидеть 3 созданных инструмента:

<figure><img src="../../../.gitbook/assets/image (3) (3) (1) (1).png" alt=""><figcaption></figcaption></figure>

### Создание чат-потока

Вы можете использовать шаблон **OpenAI Function Agent** из маркетплейса и заменить инструменты на **Custom Tool**. Выберите созданный вами инструмент.

Примечание: OpenAI Function Agent в настоящее время поддерживает только модели 0613.

<figure><img src="../../../.gitbook/assets/image (15) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

Сохраните чат-поток и начните его тестировать. Для начала вы можете попробовать спросить:

_<mark style="color:blue;">Какая акция имеет наибольшее движение цены сегодня?</mark>_

_<mark style="color:orange;">Акция с наибольшим движением цены сегодня - это Overstock.com (OSTK) с движением цены 17.47%.</mark>_

Затем вы можете задать дополнительный вопрос, чтобы получить новости об этой конкретной акции:

_<mark style="color:blue;">Какие последние новости об этой акции могли вызвать движение цены?</mark>_

_<mark style="color:orange;">Вот последние новости об Overstock.com (OSTK), которые могли вызвать движение цены:</mark>_

1. _<mark style="color:orange;">Заголовок: "Акции Overstock взлетели после успешной заявки на 21.5 миллиона за активы Bed Bath & Beyond" Источник: MarketWatch Дата публикации: 22 июня 2023 г. Сводка: Акции Overstock.com значительно выросли после успешного выигрыша заявки на активы Bed Bath & Beyond стоимостью 21.5 миллиона.</mark>_
2. _<mark style="color:orange;">Заголовок: "Думаете о торговле опционами или акциями Meta Platforms, Overstock.com, Walmart, Home Depot или United Parcel Service?" Источник: PR Newswire Дата публикации: 22 июня 2023 г. Сводка: Эта новостная статья обсуждает потенциальные торговые опционы и акции, включая Overstock.com, которые инвесторы могут рассмотреть.</mark>_

_<mark style="color:orange;">Обратите внимание, что эти новостные статьи предназначены только для информационных целей и могут не быть единственной причиной движения цены. Всегда рекомендуется проводить тщательное исследование и анализ перед принятием любых инвестиционных решений.</mark>_

Наконец, вы можете попросить ChatGPT добавить новую запись в Airtable:

_<mark style="color:blue;">Можете ли вы добавить запись в Airtable с тикером акции, движением цены и сводкой новостей?</mark>_

_<mark style="color:orange;">Я добавил запись в Airtable со следующими деталями:</mark>_

_<mark style="color:orange;">Тикер акции: OSTK Движение цены: 17.47% Сводка новостей: Акции Overstock.com значительно выросли после успешного выигрыша заявки на активы Bed Bath & Beyond стоимостью $21.5 миллиона.</mark>_

🎉🎉**Вуаля!** Вот как вы можете создать свой собственный пользовательский инструмент и использовать его с OpenAI Function Agent!

## Дополнительно

### Передача Session ID в функцию

По умолчанию функция в пользовательском инструменте имеет доступ к следующим конфигурациям потока:

```json5
$flow.sessionId 
$flow.chatId
$flow.chatflowId
$flow.input
```

Ниже пример отправки sessionId в Discord webhook:

{% tabs %}
{% tab title="Javascript" %}
```javascript
const fetch = require('node-fetch');
const webhookUrl = "https://discord.com/api/webhooks/1124783587267";
const content = $content; // захвачено из схемы ввода
const sessionId = $flow.sessionId;

const body = {
	"content": `${mycontent} и sessionid это ${sessionId}`
};

const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(body)
};

const url = `${webhookUrl}?wait=true`

try {
	const response = await fetch(url, options);
	const text = await response.text();
	return text;
} catch (error) {
	console.error(error);
	return '';
}
```
{% endtab %}
{% endtabs %}

### Передача переменных в функцию

В некоторых случаях вы хотели бы передать переменные в функцию пользовательского инструмента.

Например, вы создаете чатбота, который использует пользовательский инструмент. Пользовательский инструмент выполняет HTTP POST вызов, и API ключ нужен для успешного аутентифицированного запроса. Вы можете передать его как переменную.

По умолчанию функция в пользовательском инструменте имеет доступ к переменным:

```
$vars.<имя-переменной>
```

Пример того, как передать переменные в Flowise используя API и Embedded:

{% tabs %}
{% tab title="Javascript API" %}
```javascript
async function query(data) {
    const response = await fetch(
        "http://localhost:3000/api/v1/prediction/<chatflow-id>",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({
    "question": "Привет, как дела?",
    "overrideConfig": {
        "vars": {
            "apiKey": "abc"
        }
    }
}).then((response) => {
    console.log(response);
});
```
{% endtab %}

{% tab title="Embed" %}
```html
<script type="module">
    import Chatbot from 'https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js';
    Chatbot.init({
        chatflowid: 'chatflow-id',
        apiHost: 'http://localhost:3000',
        chatflowConfig: {
          vars: {
            apiKey: 'def'
          }
        }
    });
</script>
```
{% endtab %}
{% endtabs %}

Пример того, как получить переменные в пользовательском инструменте:

{% tabs %}
{% tab title="Javascript" %}
```javascript
const fetch = require('node-fetch');
const webhookUrl = "https://discord.com/api/webhooks/1124783587267";
const content = $content; // захвачено из схемы ввода
const sessionId = $flow.sessionId;
const apiKey = $vars.apiKey;

const body = {
	"content": `${mycontent} и sessionid это ${sessionId}`
};

const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${apiKey}`
	},
	body: JSON.stringify(body)
};

const url = `${webhookUrl}?wait=true`

try {
	const response = await fetch(url, options);
	const text = await response.text();
	return text;
} catch (error) {
	console.error(error);
	return '';
}
```
{% endtab %}
{% endtabs %}

### Переопределение пользовательского инструмента

Параметры ниже могут быть переопределены

| Параметр         | Описание         |
| ---------------- | ---------------- |
| customToolName   | имя инструмента  |
| customToolDesc   | описание инструмента |
| customToolSchema | схема инструмента |
| customToolFunc   | функция инструмента |

Пример API вызова для переопределения параметров пользовательского инструмента:

{% tabs %}
{% tab title="Javascript API" %}
```javascript
async function query(data) {
    const response = await fetch(
        "http://localhost:3000/api/v1/prediction/<chatflow-id>",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

query({
    "question": "Привет, как дела?",
    "overrideConfig": {
        "customToolName": "example_tool",
        "customToolSchema": "z.object({title: z.string()})"
    }
}).then((response) => {
    console.log(response);
});
```
{% endtab %}
{% endtabs %}

### Импорт внешних зависимостей

Вы можете импортировать любые встроенные [модули](https://www.w3schools.com/nodejs/ref_modules.asp) NodeJS и поддерживаемые [внешние библиотеки](https://github.com/FlowiseAI/Flowise/blob/main/packages/components/src/utils.ts#L289) в функцию.

1. Для импорта любых неподдерживаемых библиотек вы можете легко добавить новый npm пакет в `package.json` в папке `packages/components`.

```bash
cd Flowise && cd packages && cd components
pnpm add <ваша-библиотека>
cd .. && cd ..
pnpm install
pnpm build
```

2. Затем добавьте импортированные библиотеки в переменную окружения `TOOL_FUNCTION_EXTERNAL_DEP`. Обратитесь к [#builtin-and-external-dependencies](../../../configuration/environment-variables.md#builtin-and-external-dependencies "mention") для более подробной информации.
3. Запустите приложение

```bash
pnpm start
```

4. Затем вы можете использовать недавно добавленную библиотеку в **JavaScript функции** вот так:

```javascript
const axios = require('axios')
```

Посмотрите, как добавить дополнительные зависимости и импортировать библиотеки

{% embed url="https://youtu.be/0H1rrisc0ok" %}
