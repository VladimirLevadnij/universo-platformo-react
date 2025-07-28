---
description: Узнайте, как подключить ваш экземпляр Flowise к базе данных
---

# Базы данных

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

---

## Настройка

Flowise поддерживает 4 типа баз данных:

- SQLite
- MySQL
- PostgreSQL
- MariaDB

### SQLite (По умолчанию)

SQLite будет базой данных по умолчанию. Эти базы данных можно настроить с помощью следующих переменных окружения:

```sh
DATABASE_TYPE=sqlite
DATABASE_PATH=/root/.flowise #ваше предпочтительное расположение
```

Файл `database.sqlite` будет создан и сохранен по пути, указанному в `DATABASE_PATH`. Если не указано, путь хранения по умолчанию будет в вашей домашней директории -> .flowise

**Примечание:** Если ни одна из переменных окружения не указана, SQLite будет резервным выбором базы данных.

### MySQL

```sh
DATABASE_TYPE=mysql
DATABASE_PORT=3306
DATABASE_HOST=localhost
DATABASE_NAME=flowise
DATABASE_USER=user
DATABASE_PASSWORD=123
```

### PostgreSQL

```sh
DATABASE_TYPE=postgres
DATABASE_PORT=5432
DATABASE_HOST=localhost
DATABASE_NAME=flowise
DATABASE_USER=user
DATABASE_PASSWORD=123
PGSSLMODE=require
```

### MariaDB

```bash
DATABASE_TYPE="mariadb"
DATABASE_PORT="3306"
DATABASE_HOST="localhost"
DATABASE_NAME="flowise"
DATABASE_USER="flowise"
DATABASE_PASSWORD="mypassword"
```

### Как использовать базы данных Flowise SQLite и MySQL/MariaDB

{% embed url="https://youtu.be/R-6uV1Cb8I8" %}

## Резервное копирование

1. Остановите приложение FlowiseAI.
2. Убедитесь, что подключение к базе данных от других приложений отключено.
3. Создайте резервную копию вашей базы данных.
4. Протестируйте резервную копию базы данных.

### SQLite

1. Переименуйте файл.

   Windows:

   ```bash
   rename "DATABASE_PATH\database.sqlite" "DATABASE_PATH\BACKUP_FILE_NAME.sqlite"
   ```

   Linux:

   ```bash
   mv DATABASE_PATH/database.sqlite DATABASE_PATH/BACKUP_FILE_NAME.sqlite
   ```

2. Создайте резервную копию базы данных.

   Windows:

   ```bash
   copy DATABASE_PATH\BACKUP_FILE_NAME.sqlite DATABASE_PATH\database.sqlite
   ```

   Linux:

   ```bash
   cp DATABASE_PATH/BACKUP_FILE_NAME.sqlite DATABASE_PATH/database.sqlite
   ```

3. Протестируйте резервную копию базы данных, запустив Flowise.

### PostgreSQL

1. Создайте резервную копию базы данных.

   ```bash
   pg_dump -U USERNAME -h HOST -p PORT -d DATABASE_NAME -f /PATH/TO/BACKUP_FILE_NAME.sql
   ```

2. Введите пароль базы данных.
3. Создайте тестовую базу данных.
   ```bash
   psql -U USERNAME -h HOST -p PORT -d TEST_DATABASE_NAME -f /PATH/TO/BACKUP_FILE_NAME.sql
   ```
4. Протестируйте резервную копию базы данных, запустив Flowise с измененным файлом `.env`, указывающим на резервную базу данных.

### MySQL & MariaDB

1. Создайте резервную копию базы данных.

   ```bash
   mysqldump -u USERNAME -p DATABASE_NAME > BACKUP_FILE_NAME.sql
   ```

2. Введите пароль базы данных.
3. Создайте тестовую базу данных.
   ```bash
   mysql -u USERNAME -p TEST_DATABASE_NAME < BACKUP_FILE_NAME.sql
   ```
4. Протестируйте резервную копию базы данных, запустив Flowise с измененным файлом `.env`, указывающим на резервную базу данных.
