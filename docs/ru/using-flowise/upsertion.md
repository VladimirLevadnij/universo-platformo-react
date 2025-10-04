# Обновление

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Upsert относится к процессу загрузки и обработки документов в векторные хранилища, формируя основу систем расширенной генерации поиска (RAG).

Существует два основных способа загрузки данных в векторное хранилище:

* [Хранилища документов (Рекомендуется)](document-stores.md)
* Upsert чат-потока

Мы настоятельно рекомендуем использовать хранилища документов, поскольку они предоставляют унифицированный интерфейс для помощи с конвейерами RAG - извлечение данных из различных источников, стратегия разбиения на части, загрузка в векторную базу данных, синхронизация с обновленными данными.

В этом руководстве мы рассмотрим другой метод - Upsert чат-потока. Это более старый метод, предшествующий хранилищам документов.

Для подробностей см. [Справочник API конечной точки Vector Upsert](../api-reference/vector-upsert.md).

## Понимание процесса обновления

Чат-поток позволяет создать поток, который может выполнять как процесс обновления, так и процесс запроса RAG, оба могут выполняться независимо.

<figure><img src="../.gitbook/assets/ud_01.png" alt=""><figcaption><p>Upsert против RAG</p></figcaption></figure>

## Настройка

Для работы процесса upsert нам нужно создать **поток обновления** с 5 различными узлами:

1. Загрузчик документов
2. Разделитель текста
3. Модель встраивания
4. Векторное хранилище
5. Менеджер записей (Опционально)

Все элементы были рассмотрены в [Хранилищах документов](document-stores.md), обратитесь туда для получения более подробной информации.

После правильной настройки потока в правом верхнем углу появится зеленая кнопка, которая позволяет пользователю начать процесс upsert.

<figure><img src="../.gitbook/assets/Picture1.png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

Процесс upsert также может быть выполнен через API:

<figure><img src="../.gitbook/assets/image (2) (1) (1) (1).png" alt="" width="563"><figcaption></figcaption></figure>

## Базовый URL и аутентификация

**Базовый URL**: `http://localhost:3000` (или URL вашего экземпляра Flowise)

**Конечная точка**: `POST /api/v1/vector/upsert/:id`

**Аутентификация**: Обратитесь к [Аутентификации для потоков](../configuration/authorization/canvas-level.md)

## Методы запросов

API поддерживает два различных метода запросов в зависимости от конфигурации вашего чат-потока:

#### 1. Form Data (Загрузка файлов)

Используется, когда ваш чат-поток содержит загрузчики документов с возможностью загрузки файлов.

#### 2. JSON Body (Без загрузки файлов)

Используется, когда ваш чат-поток использует загрузчики документов, которые не требуют загрузки файлов (например, веб-скраперы, коннекторы баз данных).

{% hint style="warning" %}
Чтобы переопределить любые конфигурации узлов, такие как файлы, метаданные и т.д., вы должны явно включить эту опцию.
{% endhint %}

<figure><img src="../.gitbook/assets/image (3) (1) (1).png" alt=""><figcaption></figcaption></figure>

### Загрузчики документов с загрузкой файлов

#### Поддерживаемые типы документов

| Загрузчик документов | Типы файлов |
| -------------------- | ----------- |
| CSV File             | `.csv`      |
| Docx/Word File       | `.docx`     |
| JSON File            | `.json`     |
| JSON Lines File      | `.jsonl`    |
| PDF File             | `.pdf`      |
| Text File            | `.txt`      |
| Excel File           | `.xlsx`     |
| Powerpoint File      | `.pptx`     |
| File Loader          | Множество   |
| Unstructured File    | Множество   |

{% hint style="info" %}
**Важно**: Убедитесь, что тип файла соответствует конфигурации вашего загрузчика документов. Для максимальной гибкости рассмотрите использование File Loader, который поддерживает множество типов файлов.
{% endhint %}

#### Формат запроса (Form Data)

При загрузке файлов используйте `multipart/form-data` вместо JSON:

#### Примеры

{% tabs %}
{% tab title="Python" %}
```python
import requests
import os

def upsert_document(canvas_id, file_path, config=None):
    """
    Загрузить один документ в векторное хранилище.
    
    Args:
        canvas_id (str): ID чат-потока, настроенного для векторного обновления
        file_path (str): Путь к файлу для загрузки
        config (dict): Опциональные переопределения конфигурации
    
    Returns:
        dict: Ответ API, содержащий результаты upsert
    """
    url = f"http://localhost:3000/api/v1/vector/upsert/{canvas_id}"
    
    # Подготовка данных файла
    files = {
        'files': (os.path.basename(file_path), open(file_path, 'rb'))
    }
    
    # Подготовка данных формы
    data = {}
    
    # Добавление переопределений конфигурации, если предоставлены
    if config:
        data['overrideConfig'] = str(config).replace("'", '"')  # Преобразование в JSON строку
    
    try:
        response = requests.post(url, files=files, data=data)
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Загрузка не удалась: {e}")
        return None
    finally:
        # Всегда закрывать файл
        files['files'][1].close()

# Пример использования
result = upsert_document(
    canvas_id="your-canvas-id",
    file_path="documents/knowledge_base.pdf",
    config={
        "chunkSize": 1000,
        "chunkOverlap": 200
    }
)

if result:
    print(f"Успешно загружено {result.get('numAdded', 0)} частей")
    if result.get('sourceDocuments'):
        print(f"Исходные документы: {len(result['sourceDocuments'])}")
else:
    print("Загрузка не удалась")
```
{% endtab %}

{% tab title="Javascript (Browser)" %}
```javascript
class VectorUploader {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }
    
    async upsertDocument(canvasId, file, config = {}) {
        /**
         * Загрузить файл в векторное хранилище из браузера
         * @param {string} canvasId - ID чат-потока
         * @param {File} file - Объект файла из элемента input
         * @param {Object} config - Опциональная конфигурация
         */
        
        const formData = new FormData();
        formData.append('files', file);
        
        if (config.overrideConfig) {
            formData.append('overrideConfig', JSON.stringify(config.overrideConfig));
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/vector/upsert/${canvasId}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка! статус: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Загрузка не удалась:', error);
            throw error;
        }
    }
}

// Пример использования в браузере
const uploader = new VectorUploader();

// Загрузка одного файла
document.getElementById('fileInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        try {
            const result = await uploader.upsertDocument(
                'your-canvas-id',
                file,
                {
                    overrideConfig: {
                        chunkSize: 1000,
                        chunkOverlap: 200
                    }
                }
            );
            
            console.log('Загрузка успешна:', result);
            alert(`Успешно обработано ${result.numAdded || 0} частей`);
            
        } catch (error) {
            console.error('Загрузка не удалась:', error);
            alert('Загрузка не удалась: ' + error.message);
        }
    }
});
```
{% endtab %}
{% endtabs %}
