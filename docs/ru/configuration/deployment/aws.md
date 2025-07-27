---
description: Узнайте, как развернуть Flowise на AWS
---

# AWS

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

## Предварительные требования

Это требует базового понимания того, как работает AWS.

Доступны два варианта развертывания Flowise на AWS:

* [Развертывание на ECS с использованием CloudFormation](aws.md#развертывание-на-ecs-с-использованием-cloudformation)
* [Ручная настройка экземпляра EC2](aws.md#запуск-экземпляра-ec2)

## Развертывание на ECS с использованием CloudFormation

Шаблон CloudFormation доступен здесь: [https://gist.github.com/MrHertal/549b31a18e350b69c7200ae8d26ed691](https://gist.github.com/MrHertal/549b31a18e350b69c7200ae8d26ed691)

Он развертывает Flowise на кластере ECS, доступном через ELB.

Он был вдохновлен этой эталонной архитектурой: [https://github.com/aws-samples/ecs-refarch-cloudformation](https://github.com/aws-samples/ecs-refarch-cloudformation)

Не стесняйтесь редактировать этот шаблон для адаптации таких вещей, как версия образа Flowise, переменные окружения и т.д.

Пример команды для развертывания Flowise с использованием [AWS CLI](https://aws.amazon.com/fr/cli/):

```bash
aws cloudformation create-stack --stack-name flowise --template-body file://flowise-cloudformation.yml --capabilities CAPABILITY_IAM
```

После развертывания URL вашего приложения Flowise доступен в выводах стека CloudFormation.

## Развертывание на ECS с использованием Terraform

Файлы Terraform (`variables.tf`, `main.tf`) доступны в этом репозитории GitHub: [terraform-flowise-setup](https://github.com/huiseo/terraform-flowise-setup/tree/main).

Эта настройка развертывает Flowise на кластере ECS, доступном через Application Load Balancer (ALB). Она основана на лучших практиках AWS для развертываний ECS.

Вы можете изменить шаблон Terraform для настройки:

* Версии образа Flowise
* Переменных окружения
* Конфигураций ресурсов (CPU, память и т.д.)

### Примеры команд для развертывания:

1. **Инициализация Terraform:**

```bash
terraform init
terraform apply
terraform destroy
```

## Запуск экземпляра EC2

1. В панели управления EC2 нажмите **Launch Instance** (Запустить экземпляр)

2. Выберите **Amazon Linux 2 AMI (HVM), SSD Volume Type**

3. Выберите тип экземпляра. Для тестирования подойдет **t2.micro** (включен в бесплатный уровень)

4. В разделе **Configure Instance Details** (Настроить детали экземпляра):
   - Убедитесь, что **Auto-assign Public IP** (Автоматическое назначение публичного IP) включено
   - В **Advanced Details** (Дополнительные детали) добавьте следующий скрипт в **User data** (Пользовательские данные):

```bash
#!/bin/bash
yum update -y
yum install -y docker
service docker start
usermod -a -G docker ec2-user

# Установка Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Создание директории для Flowise
mkdir -p /home/ec2-user/flowise
cd /home/ec2-user/flowise

# Создание docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.1'

services:
  flowise:
    image: flowiseai/flowise
    restart: always
    environment:
      - PORT=3000
      - FLOWISE_USERNAME=admin
      - FLOWISE_PASSWORD=1234
      - FLOWISE_FILE_SIZE_LIMIT=50mb
    ports:
      - '3000:3000'
    volumes:
      - ~/.flowise:/root/.flowise
    command: /bin/sh -c "sleep 3; flowise start"
EOF

# Запуск Flowise
docker-compose up -d
```

5. **Настройка группы безопасности:**
   - Создайте новую группу безопасности или используйте существующую
   - Добавьте правило входящего трафика:
     - Тип: Custom TCP Rule
     - Порт: 3000
     - Источник: 0.0.0.0/0 (для тестирования) или ваш IP

6. **Запуск экземпляра:**
   - Просмотрите настройки и нажмите **Launch** (Запустить)
   - Выберите существующую пару ключей или создайте новую

## Настройка базы данных

### Использование RDS для продакшена

Для продакшенного развертывания рекомендуется использовать Amazon RDS:

1. **Создание экземпляра RDS:**
   - Выберите PostgreSQL или MySQL
   - Настройте параметры подключения
   - Убедитесь, что группа безопасности разрешает подключения от EC2

2. **Обновление переменных окружения:**

```yaml
environment:
  - DATABASE_TYPE=postgres
  - DATABASE_HOST=your-rds-endpoint.amazonaws.com
  - DATABASE_PORT=5432
  - DATABASE_USER=flowise
  - DATABASE_PASSWORD=your-secure-password
  - DATABASE_NAME=flowise
  - DATABASE_SSL=true
```

## Настройка хранилища

### Использование S3 для файлов

Для хранения загруженных файлов используйте S3:

1. **Создание S3 корзины:**
   - Создайте корзину в том же регионе
   - Настройте политики доступа

2. **Настройка IAM роли:**
   - Создайте роль с доступом к S3
   - Прикрепите роль к EC2 экземпляру

3. **Обновление переменных окружения:**

```yaml
environment:
  - STORAGE_TYPE=s3
  - S3_STORAGE_BUCKET_NAME=your-flowise-bucket
  - S3_STORAGE_REGION=us-east-1
```

## Мониторинг и логирование

### CloudWatch интеграция

1. **Настройка CloudWatch агента:**

```bash
# Установка CloudWatch агента
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

2. **Конфигурация логирования:**

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ec2-user/flowise/logs/*.log",
            "log_group_name": "flowise-logs",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

## Безопасность

### Лучшие практики безопасности

1. **Сетевая безопасность:**
   - Используйте VPC с приватными подсетями
   - Настройте NAT Gateway для исходящего трафика
   - Ограничьте доступ через Security Groups

2. **Шифрование:**
   - Включите шифрование EBS томов
   - Используйте SSL/TLS для всех подключений
   - Настройте шифрование в покое для RDS

3. **Управление доступом:**
   - Используйте IAM роли вместо ключей доступа
   - Применяйте принцип минимальных привилегий
   - Регулярно ротируйте пароли и ключи

## Масштабирование

### Auto Scaling настройка

1. **Создание Launch Template:**
   - Определите конфигурацию экземпляра
   - Включите пользовательские данные для автоматической настройки

2. **Настройка Auto Scaling Group:**
   - Определите минимальное и максимальное количество экземпляров
   - Настройте политики масштабирования на основе метрик

3. **Load Balancer конфигурация:**
   - Используйте Application Load Balancer
   - Настройте health checks
   - Включите sticky sessions если необходимо

## Резервное копирование

### Стратегия резервного копирования

1. **Автоматические снимки EBS:**
   - Настройте ежедневные снимки
   - Определите политику хранения

2. **Резервное копирование базы данных:**
   - Включите автоматические резервные копии RDS
   - Настройте cross-region репликацию для критических данных

## Заключение

Развертывание Flowise на AWS предоставляет масштабируемое и надежное решение. Выберите подходящий метод развертывания в зависимости от ваших требований:

- **CloudFormation/Terraform** - для автоматизированного развертывания
- **EC2** - для простых установок и тестирования
- **ECS** - для контейнеризованных продакшенных развертываний

Всегда следуйте лучшим практикам безопасности и мониторинга для продакшенных сред.
