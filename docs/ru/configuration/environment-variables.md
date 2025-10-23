---
description: Узнайте, как настроить переменные окружения для Flowise
---

# Переменные окружения

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Flowise поддерживает различные переменные окружения для настройки вашего экземпляра. Вы можете указать следующие переменные в файле `.env` внутри папки `packages/flowise-server`. Обратитесь к файлу [.env.example](https://github.com/FlowiseAI/Flowise/blob/main/packages/flowise-server/.env.example).

<table><thead><tr><th width="233">Переменная</th><th width="219">Описание</th><th width="104">Тип</th><th>По умолчанию</th></tr></thead><tbody><tr><td>PORT</td><td>HTTP порт, на котором работает Flowise</td><td>Number</td><td>3000</td></tr><tr><td>FLOWISE_FILE_SIZE_LIMIT</td><td>Максимальный размер файла при загрузке</td><td>String</td><td><code>50mb</code></td></tr><tr><td>NUMBER_OF_PROXIES</td><td>Прокси для ограничения скорости</td><td>Number</td><td></td></tr><tr><td>CORS_ORIGINS</td><td>Разрешенные источники для всех межсайтовых HTTP вызовов</td><td>String</td><td></td></tr><tr><td>IFRAME_ORIGINS</td><td>Разрешенные источники для встраивания iframe src</td><td>String</td><td></td></tr><tr><td>SHOW_COMMUNITY_NODES</td><td>Отображать узлы, созданные сообществом</td><td>Boolean: <code>true</code> или <code>false</code></td><td></td></tr><tr><td>DISABLED_NODES</td><td>Список имен узлов для отключения, разделенный запятыми</td><td>String</td><td></td></tr></tbody></table>

## Для базы данных

| Переменная         | Описание                                                         | Тип                                        | По умолчанию             |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------ | ------------------------ |
| DATABASE\_TYPE     | Тип базы данных для хранения данных Flowise                      | Enum String: `sqlite`, `mysql`, `postgres` | `sqlite`                 |
| DATABASE\_PATH     | Местоположение сохранения базы данных (когда DATABASE\_TYPE sqlite) | String                                     | `your-home-dir/.flowise` |
| DATABASE\_HOST     | URL хоста или IP адрес (когда DATABASE\_TYPE не sqlite)          | String                                     |                          |
| DATABASE\_PORT     | Порт базы данных (когда DATABASE\_TYPE не sqlite)                | String                                     |                          |
| DATABASE\_USER     | Имя пользователя базы данных (когда DATABASE\_TYPE не sqlite)    | String                                     |                          |
| DATABASE\_PASSWORD | Пароль базы данных (когда DATABASE\_TYPE не sqlite)              | String                                     |                          |
| DATABASE\_NAME     | Имя базы данных (когда DATABASE\_TYPE не sqlite)                 | String                                     |                          |
| DATABASE\_SSL      | Требуется SSL для базы данных (когда DATABASE\_TYPE не sqlite)   | Boolean: `true` или `false`                | `false`                  |

## Для хранилища

Flowise по умолчанию хранит следующие файлы в локальной папке.

* Файлы, загруженные в [загрузчики документов](../integrations/langchain/document-loaders/)/хранилище документов
* Загрузки изображений/аудио из чата
* Изображения/файлы от ассистента
* Файлы из [Vector Upsert API](broken-reference)

Пользователь может указать `STORAGE_TYPE` для использования AWS S3, Google Cloud Storage или локального пути

| Переменная                             | Описание                                                                         | Тип                               | По умолчанию                     |
| -------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------- | -------------------------------- |
| STORAGE\_TYPE                          | Тип хранилища для загруженных файлов. по умолчанию `local`                       | Enum String: `s3`, `gcs`, `local` | `local`                          |
| BLOB\_STORAGE\_PATH                    | Путь к локальной папке для хранения загруженных файлов когда `STORAGE_TYPE` `local` | String                            | `your-home-dir/.flowise/storage` |
| S3\_STORAGE\_BUCKET\_NAME              | Имя корзины для хранения загруженных файлов когда `STORAGE_TYPE` `s3`            | String                            |                                  |
| S3\_STORAGE\_ACCESS\_KEY\_ID           | AWS ключ доступа                                                                 | String                            |                                  |
| S3\_STORAGE\_SECRET\_ACCESS\_KEY       | AWS секретный ключ                                                               | String                            |                                  |
| S3\_STORAGE\_REGION                    | Регион для S3 корзины                                                            | String                            |                                  |
| S3\_ENDPOINT\_URL                      | Пользовательская конечная точка S3 (опционально)                                 | String                            |                                  |
| S3\_FORCE\_PATH\_STYLE                 | Принудительный стиль пути S3 (опционально)                                       | Boolean                           | false                            |
| GOOGLE\_CLOUD\_STORAGE\_CREDENTIAL     | Ключ сервисного аккаунта Google Cloud                                            | String                            |                                  |
| GOOGLE\_CLOUD\_STORAGE\_PROJ\_ID       | ID проекта Google Cloud                                                          | String                            |                                  |
| GOOGLE\_CLOUD\_STORAGE\_BUCKET\_NAME   | Имя корзины Google Cloud Storage                                                 | String                            |                                  |
| GOOGLE\_CLOUD\_UNIFORM\_BUCKET\_ACCESS | Тип доступа                                                                      | Boolean                           | true                             |

## Для отладки и логов

| Переменная | Описание                            | Тип                                              | По умолчанию                   |
| ---------- | ----------------------------------- | ------------------------------------------------ | ------------------------------ |
| DEBUG      | Печатать логи из компонентов        | Boolean                                          |                                |
| LOG\_PATH  | Местоположение хранения файлов логов | String                                           | `Flowise/packages/flowise-server/logs` |
| LOG\_LEVEL | Различные уровни логов              | Enum String: `error`, `info`, `verbose`, `debug` | `info`                         |

`DEBUG`: если установлено в true, будет печатать логи в терминал/консоль:

<figure><img src="../.gitbook/assets/image (3) (3) (1).png" alt=""><figcaption></figcaption></figure>

`LOG_LEVEL`: Различные уровни логов для сохранения логгерами. Может быть `error`, `info`, `verbose`, или `debug`. По умолчанию установлено в `info`, только `logger.info` будет сохраняться в файлы логов. Если вы хотите иметь полные детали, установите в `debug`.

<figure><img src="../.gitbook/assets/image (2) (4).png" alt=""><figcaption><p><strong>server-requests.log.jsonl - логирует каждый запрос, отправленный в Flowise</strong></p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption><p><strong>server.log - логирует общие действия в Flowise</strong></p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (5) (4).png" alt=""><figcaption><p><strong>server-error.log - логирует ошибки со стеком вызовов</strong></p></figcaption></figure>

### Потоковая передача логов S3

Когда переменная окружения `STORAGE_TYPE` установлена в `s3`, логи будут автоматически передаваться и сохраняться в S3. Новый файл лога будет создаваться каждый час, что упрощает отладку.

### Потоковая передача логов GCS

Когда переменная окружения `STORAGE_TYPE` установлена в `gcs`, логи будут автоматически передаваться в Google [Cloud Logging](https://cloud.google.com/logging?hl=en).

## Для учетных данных

Flowise хранит ваши API ключи третьих сторон как зашифрованные учетные данные, используя ключ шифрования.

По умолчанию случайный ключ шифрования будет сгенерирован при запуске приложения и сохранен в файле. Этот ключ шифрования затем извлекается каждый раз для расшифровки учетных данных, используемых в чат-потоке. Например, ваш OpenAI API ключ, Pinecone API ключ и т.д.

Вы можете настроить использование AWS Secret Manager для хранения ключа шифрования вместо этого.

| Переменная                    | Описание                                                  | Тип                         | По умолчанию              |
| ----------------------------- | --------------------------------------------------------- | --------------------------- | ------------------------- |
| SECRETKEY\_STORAGE\_TYPE      | Как хранить ключ шифрования                               | Enum String: `local`, `aws` | `local`                   |
| SECRETKEY\_PATH               | Локальный путь к файлу, где сохраняется ключ шифрования   | String                      | `Flowise/packages/flowise-server` |
| FLOWISE\_SECRETKEY\_OVERWRITE | Ключ шифрования для использования вместо существующего    | String                      |                           |
| SECRETKEY\_AWS\_ACCESS\_KEY   | AWS ключ доступа для Secret Manager                       | String                      |                           |
| SECRETKEY\_AWS\_SECRET\_KEY   | AWS секретный ключ для Secret Manager                     | String                      |                           |
| SECRETKEY\_AWS\_REGION        | AWS регион для Secret Manager                             | String                      |                           |

По некоторым причинам иногда ключ шифрования может быть перегенерирован или сохраненный путь был изменен, это вызовет ошибки типа - <mark style="color:red;">Учетные данные не могут быть расшифрованы.</mark>

Чтобы избежать этого, вы можете установить свой собственный ключ шифрования как `FLOWISE_SECRETKEY_OVERWRITE`, так что один и тот же ключ шифрования будет использоваться каждый раз. Нет ограничений на формат, вы можете установить его как любой текст, который хотите, или такой же как ваш `FLOWISE_PASSWORD`.

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>
