# Миграция в облако

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Это руководство поможет пользователям мигрировать с Cloud V1 на V2.

В Cloud V1 URL приложений выглядит как <mark style="color:blue;">**https://\<your-instance-name>.app.flowiseai.com**</mark>

В Cloud V2 URL приложений: <mark style="color:blue;">**https://cloud.flowiseai.com**</mark>

Почему Cloud V2? Мы переписали облако с нуля, что дает 5-кратное улучшение скорости, возможность иметь несколько рабочих пространств, участников организации и, что самое важное, высокую масштабируемость с [архитектурой, готовой к продакшену](../configuration/running-in-production.md).

1. Войдите в Cloud V1 через [https://flowiseai.com/auth/login](https://flowiseai.com/auth/login)
2. В вашей панели управления, в правом верхнем углу:

<figure><img src="../.gitbook/assets/image (8) (2).png" alt=""><figcaption></figcaption></figure>

3. **Выберите Version, затем обновите до последней версии.**

<figure><img src="../.gitbook/assets/migration-guide/cloud-migration/3.png" alt="" width="563"><figcaption></figcaption></figure>

4. Выберите Export, выберите данные, которые вы хотите экспортировать:

<figure><img src="../.gitbook/assets/image (20) (2).png" alt="" width="563"><figcaption></figcaption></figure>

5. Сохраните экспортированный JSON файл.
6. Перейдите в Cloud V2 [https://cloud.flowiseai.com](https://cloud.flowiseai.com/)
7. Аккаунт Cloud V2 не синхронизируется с вашим существующим аккаунтом в Cloud V1, вам придется зарегистрироваться снова или войти через Google/Github.

<figure><img src="../.gitbook/assets/image (37).png" alt="" width="563"><figcaption></figcaption></figure>

8. После входа в систему, из правого верхнего угла панели управления нажмите Import и загрузите экспортированный JSON файл.

<figure><img src="../.gitbook/assets/image (42).png" alt=""><figcaption></figcaption></figure>

9. Новый пользователь по умолчанию находится на **бесплатном плане** с ограничением в 2 потока и ассистента (для каждого). Если ваши экспортированные данные содержат больше этого, импорт экспортированного JSON файла выдаст ошибку. Поэтому мы предоставляем <mark style="color:orange;">**ПЕРВЫЙ МЕСЯЦ БЕСПЛАТНО**</mark> на **стартовом плане**, который имеет неограниченные потоки и ассистентов!

<figure><img src="../.gitbook/assets/image (55).png" alt=""><figcaption></figcaption></figure>

10. Нажмите кнопку **Get Started** и добавьте предпочитаемый способ оплаты:

<figure><img src="../.gitbook/assets/image (67).png" alt="" width="563"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (80).png" alt=""><figcaption></figcaption></figure>

11. После добавления способа оплаты вернитесь в Flowise, нажмите Get Started на выбранном плане и Confirm Change:

<figure><img src="../.gitbook/assets/image (95).png" alt="" width="563"><figcaption></figcaption></figure>

12. Если все прошло гладко, вы должны быть на стартовом плане с неограниченными потоками и ассистентами! Ура :tada: Попробуйте импортировать JSON файл снова, если он ранее не удавался из-за ограничения бесплатного плана.

{% hint style="success" %}
Все ID из экспортированных данных остаются теми же, поэтому вам не нужно беспокоиться об обновлении ID для API, вам просто нужно обновить URL, например [https://cloud.flowiseai.com/api/v1/prediction/69fb1055-ghj324-ghj-0a4ytrerf](https://cloud.flowiseai.com/api/v1/prediction/69fb1055-ghj324-ghj-0a4ytrerf)
{% endhint %}

{% hint style="warning" %}
Учетные данные не экспортируются. Вам придется создать новые учетные данные и использовать их в потоках и ассистентах.
{% endhint %}

13. После того как вы убедились, что все работает как ожидается, теперь вы можете отменить подписку Cloud V1.
14. На левой боковой панели нажмите Account Settings, прокрутите вниз, и вы увидите **Cancel Previous Subscription**:

<figure><img src="../.gitbook/assets/image (135).png" alt=""><figcaption></figcaption></figure>

15. Введите ваш предыдущий email, который использовался для регистрации в Cloud V1, и нажмите **Send Instructions**.
16. Затем вы получите email для отмены вашей предыдущей подписки:

<figure><img src="../.gitbook/assets/image (136).png" alt="" width="563"><figcaption></figcaption></figure>

17. Нажатие кнопки **Manage Subscription** приведет вас на портал, где вы можете отменить подписку Cloud V1. Ваше приложение Cloud V1 будет отключено в следующем расчетном цикле.

<figure><img src="../.gitbook/assets/image (137).png" alt=""><figcaption></figcaption></figure>

Мы искренне извиняемся за любые неудобства, которые мы могли причинить в процессе миграции. Если есть что-то, с чем мы можем помочь, не стесняйтесь обращаться к нам по адресу support@flowiseai.com.
