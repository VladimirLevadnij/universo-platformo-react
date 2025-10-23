# Мониторинг

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

Flowise имеет встроенную поддержку Prometheus с Grafana и OpenTelemetry. Однако отслеживаются только высокоуровневые метрики, такие как API запросы, количество потоков/предсказаний. Обратитесь [сюда](https://github.com/FlowiseAI/Flowise/blob/main/packages/flowise-server/src/Interface.Metrics.ts#L13) для списка счетчиков метрик. Для детального наблюдения узел за узлом мы рекомендуем использовать [Аналитику](broken-reference).

## Prometheus

[Prometheus](https://prometheus.io/) - это решение для мониторинга и оповещений с открытым исходным кодом.

Перед настройкой Prometheus настройте следующие переменные окружения в Flowise:

```properties
ENABLE_METRICS=true
METRICS_PROVIDER=prometheus
METRICS_INCLUDE_NODE_METRICS=true
```

После установки Prometheus запустите его, используя файл конфигурации. Flowise предоставляет файл конфигурации по умолчанию, который можно найти [здесь](https://github.com/FlowiseAI/Flowise/blob/main/metrics/prometheus/prometheus.config.yml).

Не забудьте также запустить экземпляр Flowise. Вы можете открыть браузер и перейти к порту 9090. С панели управления вы должны увидеть конечную точку метрик - `/api/v1/metrics` теперь активна.

<figure><img src="../.gitbook/assets/image (178).png" alt=""><figcaption></figcaption></figure>

По умолчанию `/api/v1/metrics` доступен для Prometheus для получения метрик.

<figure><img src="../.gitbook/assets/image (177).png" alt="" width="563"><figcaption></figcaption></figure>

## Grafana

Prometheus собирает богатые метрики и предоставляет мощный язык запросов; Grafana преобразует метрики в значимые визуализации.

Grafana может быть установлена различными способами. Обратитесь к [руководству](https://grafana.com/docs/grafana/latest/setup-grafana/installation/).

Grafana по умолчанию будет использовать порт 9091:

<figure><img src="../.gitbook/assets/image (179).png" alt=""><figcaption></figcaption></figure>

На левой боковой панели нажмите "Добавить новое соединение" и выберите Prometheus:

<figure><img src="../.gitbook/assets/image (180).png" alt=""><figcaption></figcaption></figure>

Поскольку наш Prometheus работает на порту 9090:

<figure><img src="../.gitbook/assets/image (181).png" alt=""><figcaption></figcaption></figure>

Прокрутите вниз и протестируйте соединение:

<figure><img src="../.gitbook/assets/image (182).png" alt=""><figcaption></figcaption></figure>

Обратите внимание на ID источника данных, показанный в панели инструментов, он нам понадобится для создания панелей управления:

<figure><img src="../.gitbook/assets/image (184).png" alt=""><figcaption></figcaption></figure>

Теперь, когда соединение успешно добавлено, мы можем начать добавлять панель управления. На левой боковой панели нажмите "Панели управления" и "Создать панель управления".

Flowise предоставляет 2 шаблона панелей управления:

* [grafana.dashboard.app.json.txt](https://github.com/FlowiseAI/Flowise/blob/main/metrics/grafana/grafana.dashboard.app.json.txt): API метрики, такие как количество чат-потоков/агент-потоков, количество предсказаний, инструменты, ассистенты, загруженные векторы и т.д.
* [grafana.dashboard.server.json.txt](https://github.com/FlowiseAI/Flowise/blob/main/metrics/grafana/grafana.dashboard.server.json.txt): метрики экземпляра node.js Flowise, такие как куча, использование CPU, RAM

Если вы используете шаблоны выше, найдите и замените все вхождения `cds4j1ybfuhogb` на ID источника данных, который вы создали и сохранили ранее.

<figure><img src="../.gitbook/assets/image (183).png" alt=""><figcaption></figcaption></figure>

Вы также можете выбрать сначала импортировать, а затем отредактировать JSON позже:

<figure><img src="../.gitbook/assets/image (185).png" alt=""><figcaption></figcaption></figure>

Теперь попробуйте выполнить некоторые действия в Flowise, вы должны увидеть отображаемые метрики:

<figure><img src="../.gitbook/assets/image (186).png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (187).png" alt=""><figcaption></figcaption></figure>

## OpenTelemetry

[OpenTelemetry](https://opentelemetry.io/) - это фреймворк с открытым исходным кодом для создания и управления телеметрическими данными. Чтобы включить OTel, настройте следующие переменные окружения в Flowise:

```properties
ENABLE_METRICS=true
METRICS_PROVIDER=open_telemetry
METRICS_INCLUDE_NODE_METRICS=true
METRICS_OPEN_TELEMETRY_METRIC_ENDPOINT=http://localhost:4318/v1/metrics
METRICS_OPEN_TELEMETRY_PROTOCOL=http # http | grpc | proto (по умолчанию http)
METRICS_OPEN_TELEMETRY_DEBUG=true
```

Далее нам нужен OpenTelemetry Collector для получения, обработки и экспорта телеметрических данных. Flowise предоставляет [docker compose файл](https://github.com/FlowiseAI/Flowise/blob/main/metrics/otel/compose.yaml), который можно использовать для запуска контейнера коллектора.

```bash
cd Flowise
cd metrics && cd otel
docker compose up -d
```

Коллектор будет использовать файл [otel.config.yml](https://github.com/FlowiseAI/Flowise/blob/main/metrics/otel/otel.config.yml) в той же директории для конфигураций. В настоящее время поддерживаются только [Datadog](https://www.datadoghq.com/) и Prometheus, обратитесь к документации [Open Telemetry](https://opentelemetry.io/) для настройки различных инструментов APM, таких как Zipkin, Jeager, New Relic, Splunk и другие.

Убедитесь, что заменили необходимый API ключ для экспортеров в yml файле.
