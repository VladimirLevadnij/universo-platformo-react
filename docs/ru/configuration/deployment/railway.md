---
description: Изучите, как развернуть Flowise на Railway
---

# Railway

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

1. Нажмите на следующий предварительно созданный [шаблон](https://railway.app/template/pn4G8S?referralCode=WVNPD9)
2. Нажмите Deploy Now

<figure><img src="../../.gitbook/assets/image (1) (1) (2) (1).png" alt=""><figcaption></figcaption></figure>

3. Измените на предпочитаемое имя репозитория и нажмите Deploy

<figure><img src="../../.gitbook/assets/image (2) (1) (2) (1).png" alt="" width="375"><figcaption></figcaption></figure>

4. Если успешно, вы должны увидеть развернутый URL

<figure><img src="../../.gitbook/assets/image (2) (2).png" alt=""><figcaption></figcaption></figure>

5. Чтобы добавить авторизацию, перейдите на вкладку Variables и добавьте:

* FLOWISE\_USERNAME
* FLOWISE\_PASSWORD

<figure><img src="../../.gitbook/assets/image (15) (2) (1) (1).png" alt=""><figcaption></figcaption></figure>

6. Есть список переменных окружения, которые вы можете настроить. Обратитесь к [environment-variables.md](../environment-variables.md "mention")

Вот и все! Теперь у вас есть развернутый Flowise на Railway [🎉](https://emojipedia.org/party-popper/)[🎉](https://emojipedia.org/party-popper/)

## Постоянный том

Файловая система по умолчанию для сервисов, работающих на Railway, является эфемерной. Данные Flowise не сохраняются между развертываниями и перезапусками. Чтобы решить эту проблему, мы можем использовать [Railway Volume](https://docs.railway.app/reference/volumes).

Для упрощения шагов у нас есть шаблон Railway с подключенным томом: [https://railway.app/template/nEGbjR](https://railway.app/template/nEGbjR)

Просто нажмите Deploy и заполните переменные окружения, как показано ниже:

* DATABASE\_PATH - `/opt/railway/.flowise`
* APIKEY\_PATH - `/opt/railway/.flowise`
* LOG\_PATH - `/opt/railway/.flowise/logs`
* SECRETKEY\_PATH - `/opt/railway/.flowise`
* BLOB\_STORAGE\_PATH - `/opt/railway/.flowise/storage`

<figure><img src="../../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (1).png" alt="" width="420"><figcaption></figcaption></figure>

Теперь попробуйте создать поток и сохранить его в Flowise. Затем попробуйте перезапустить сервис или повторно развернуть, вы все еще должны видеть поток, который вы сохранили ранее.
