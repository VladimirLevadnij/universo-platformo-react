---
description: Узлы менеджера записей LangChain
---

# Менеджеры записей

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

Менеджеры записей отслеживают ваши индексированные документы, предотвращая дублирование векторных эмбеддингов в [Векторном хранилище](vector-stores/).

Когда фрагменты документов загружаются, каждый фрагмент будет хеширован с использованием алгоритма [SHA-1](https://github.com/emn178/js-sha1). Эти хеши будут сохранены в менеджере записей. Если существует существующий хеш, процесс эмбеддинга и загрузки будет пропущен.

В некоторых случаях вы можете захотеть удалить существующие документы, которые происходят из тех же источников, что и новые индексируемые документы. Для этого существует 3 режима очистки для менеджера записей:

{% tabs %}
{% tab title="Инкрементальный" %}
Когда вы загружаете несколько документов и хотите предотвратить удаление существующих документов, которые не являются частью текущего процесса загрузки, используйте режим очистки **Инкрементальный**.

1. Давайте создадим менеджер записей с очисткой `Инкрементальный` и `source` как ключом SourceId

<div align="left"><figure><img src="../../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="264"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (5) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="410"><figcaption></figcaption></figure></div>

2. И имеем следующие 2 документа:

| Текст | Метаданные       |
| ----- | ---------------- |
| Кот   | `{source:"cat"}` |
| Собака| `{source:"dog"}` |

<div align="left"><figure><img src="../../.gitbook/assets/image (11) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="202"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (10) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="563"><figcaption></figcaption></figure></div>

<div align="left"><figure><img src="../../.gitbook/assets/image (2) (1) (1) (1) (1) (2).png" alt="" width="231"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="563"><figcaption></figcaption></figure></div>

3. После загрузки мы увидим 2 документа, которые были загружены:

<figure><img src="../../.gitbook/assets/image (9) (1) (1) (1) (1) (2).png" alt="" width="433"><figcaption></figcaption></figure>

4. Теперь, если мы удалим документ **Собака** и обновим **Кот** на **Коты**, мы увидим следующее:

<figure><img src="../../.gitbook/assets/image (13) (2) (2).png" alt="" width="425"><figcaption></figcaption></figure>

* Оригинальный документ **Кот** удален
* Добавлен новый документ с **Коты**
* Документ **Собака** остается нетронутым
* Оставшиеся векторные эмбеддинги в векторном хранилище - **Коты** и **Собака**

<figure><img src="../../.gitbook/assets/image (15) (1) (1) (1) (1) (1) (1).png" alt="" width="448"><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Полный" %}
Когда вы загружаете несколько документов, режим очистки **Полный** автоматически удалит любые векторные эмбеддинги, которые не являются частью текущего процесса загрузки.

1. Давайте создадим менеджер записей с очисткой `Полный`. Нам не нужен ключ SourceId для режима полной очистки.

<div align="left"><figure><img src="../../.gitbook/assets/image (4) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="264"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (17) (1) (1) (1) (2).png" alt="" width="407"><figcaption></figcaption></figure></div>

2. И имеем следующие 2 документа:

| Текст | Метаданные       |
| ----- | ---------------- |
| Кот   | `{source:"cat"}` |
| Собака| `{source:"dog"}` |

<div align="left"><figure><img src="../../.gitbook/assets/image (11) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="202"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (10) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="563"><figcaption></figcaption></figure></div>

<div align="left"><figure><img src="../../.gitbook/assets/image (2) (1) (1) (1) (1) (2).png" alt="" width="231"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="563"><figcaption></figcaption></figure></div>

3. После загрузки мы увидим 2 документа, которые были загружены:

<figure><img src="../../.gitbook/assets/image (9) (1) (1) (1) (1) (2).png" alt="" width="433"><figcaption></figcaption></figure>

4. Теперь, если мы удалим документ **Собака** и обновим **Кот** на **Коты**, мы увидим следующее:

<figure><img src="../../.gitbook/assets/image (18) (1) (1) (1) (2).png" alt="" width="430"><figcaption></figcaption></figure>

* Оригинальный документ **Кот** удален
* Добавлен новый документ с **Коты**
* Документ **Собака** удален
* Оставшиеся векторные эмбеддинги в векторном хранилище - только **Коты**

<figure><img src="../../.gitbook/assets/image (19) (1) (1) (1).png" alt="" width="527"><figcaption></figcaption></figure>
{% endtab %}

{% tab title="Нет" %}
Очистка не будет выполняться
{% endtab %}
{% endtabs %}

Текущие доступные узлы менеджера записей:

* SQLite
* MySQL
* PostgresQL

## Ресурсы

* [LangChain Индексирование - Как это работает](https://js.langchain.com/docs/how_to/indexing/#how-it-works)
