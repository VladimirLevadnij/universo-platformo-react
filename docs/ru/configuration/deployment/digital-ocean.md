---
description: Изучите, как развернуть Flowise на Digital Ocean
---

# Digital Ocean

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

***

## Создание Droplet

В этом разделе мы собираемся создать Droplet. Для получения дополнительной информации обратитесь к [официальному руководству](https://docs.digitalocean.com/products/droplets/quickstart/).

1. Сначала нажмите **Droplets** из выпадающего меню

<figure><img src="../../.gitbook/assets/image (15) (2) (2).png" alt=""><figcaption></figcaption></figure>

2. Выберите регион данных и базовый тип Droplet за $6/мес

<figure><img src="../../.gitbook/assets/image (17) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

3. Выберите метод аутентификации. В этом примере мы будем использовать пароль

<figure><img src="../../.gitbook/assets/image (5) (2).png" alt=""><figcaption></figcaption></figure>

4. Через некоторое время вы должны увидеть, что ваш droplet создан успешно

<figure><img src="../../.gitbook/assets/image (7) (2) (1).png" alt=""><figcaption></figcaption></figure>

## Как подключиться к вашему Droplet

Для Windows следуйте этому [руководству](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/putty/).

Для Mac/Linux следуйте этому [руководству](https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/openssh/).

## Установка Docker

1. ```
   curl -fsSL https://get.docker.com -o get-docker.sh
   ```
2. ```
   sudo sh get-docker.sh
   ```
3. Установите docker-compose:

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

4. Установите разрешения:

```
sudo chmod +x /usr/local/bin/docker-compose
```

## Настройка

1. Клонируйте репозиторий

```
git clone https://github.com/FlowiseAI/Flowise.git
```

2. Перейдите в папку docker

```bash
cd Flowise && cd docker
```

3. Создайте файл `.env`. Вы можете использовать ваш любимый редактор. Я буду использовать `nano`

```bash
nano .env
```

<figure><img src="../../.gitbook/assets/image (10) (2) (1).png" alt="" width="375"><figcaption></figcaption></figure>

4. Укажите переменные окружения:

```sh
PORT=3000
DATABASE_PATH=/root/.flowise
SECRETKEY_PATH=/root/.flowise
LOG_PATH=/root/.flowise/logs
BLOB_STORAGE_PATH=/root/.flowise/storage
```

5. Затем нажмите `Ctrl + X` для выхода и `Y` для сохранения файла
6. Запустите docker compose

```bash
docker compose up -d
```

7. Затем вы можете просмотреть приложение: "Ваш публичный IPv4 DNS":3000. Пример: `176.63.19.226:3000`
8. Вы можете остановить приложение командой:

```bash
docker compose stop
```

9. Вы можете получить последний образ командой:

```bash
docker pull flowiseai/flowise
```

## Добавление обратного прокси и SSL

Обратный прокси - это рекомендуемый метод для предоставления доступа к серверу приложений из интернета. Это позволит нам подключаться к нашему droplet, используя только URL вместо IP-адреса сервера и номера порта. Это обеспечивает преимущества безопасности в изоляции сервера приложений от прямого доступа из интернета, возможность централизованной защиты брандмауэром, минимизированную поверхность атаки для общих угроз, таких как атаки отказа в обслуживании, и, что наиболее важно для наших целей, возможность завершения шифрования SSL/TLS в одном месте.

> Отсутствие SSL на вашем Droplet приведет к тому, что встраиваемый виджет и конечные точки API будут недоступны в современных браузерах. Это связано с тем, что браузеры начали отказываться от HTTP в пользу HTTPS и блокируют HTTP-запросы со страниц, загруженных по HTTPS.

### Шаг 1 — Установка Nginx

1. Nginx доступен для установки с apt через репозитории по умолчанию. Обновите индекс репозитория, затем установите Nginx:

```bash
sudo apt update
sudo apt install nginx
```

> Нажмите Y для подтверждения установки. Если вас попросят перезапустить службы, нажмите ENTER для принятия значений по умолчанию.

2. Вам нужно разрешить доступ к Nginx через ваш брандмауэр. Настроив ваш сервер согласно начальным предварительным требованиям сервера, добавьте следующее правило с ufw:

```bash
sudo ufw allow 'Nginx HTTP'
```

3. Теперь вы можете проверить, что Nginx работает:

```bash
systemctl status nginx
```

Вывод:

```bash
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2022-08-29 06:52:46 UTC; 39min ago
       Docs: man:nginx(8)
   Main PID: 9919 (nginx)
      Tasks: 2 (limit: 2327)
     Memory: 2.9M
        CPU: 50ms
     CGroup: /system.slice/nginx.service
             ├─9919 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             └─9920 "nginx: worker process
```

Далее вы добавите пользовательский блок сервера с вашим доменом и прокси сервера приложений.

### Шаг 2 — Настройка блока сервера + DNS записи

Рекомендуется создать пользовательский файл конфигурации для ваших новых дополнений блока сервера, вместо прямого редактирования конфигурации по умолчанию.

1. Создайте и откройте новый файл конфигурации Nginx, используя nano или ваш предпочитаемый текстовый редактор:

```bash
sudo nano /etc/nginx/sites-available/your_domain
```

2. Вставьте следующее в ваш новый файл, убедившись заменить `your_domain` на ваше собственное доменное имя:

```
server {
    listen 80;
    listen [::]:80;
    server_name your_domain; #Пример: demo.flowiseai.com
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Сохраните и выйдите, с `nano` вы можете сделать это, нажав `CTRL+O`, затем `CTRL+X`.
4. Далее включите этот файл конфигурации, создав ссылку от него к каталогу sites-enabled, который Nginx читает при запуске, убедившись снова заменить `your_domain` на ваше собственное доменное имя:

```bash
sudo ln -s /etc/nginx/sites-available/your_domain /etc/nginx/sites-enabled/
```

5. Теперь вы можете протестировать ваш файл конфигурации на синтаксические ошибки:

```bash
sudo nginx -t
```

6. Без сообщений о проблемах перезапустите Nginx для применения ваших изменений:

```bash
sudo systemctl restart nginx
```

7. Перейдите к вашему провайдеру DNS и добавьте новую A-запись. Имя будет вашим доменным именем, а значение будет публичным IPv4 адресом из вашего droplet

<figure><img src="../../.gitbook/assets/image (3) (2).png" alt="" width="367"><figcaption></figcaption></figure>

Nginx теперь настроен как обратный прокси для вашего сервера приложений. Теперь вы должны иметь возможность открыть приложение: http://yourdomain.com.

### Шаг 3 — Установка Certbot для HTTPS (SSL)

Если вы хотите добавить безопасное `https` соединение к вашему Droplet, как https://yourdomain.com, вам нужно сделать следующее:

1. Для установки Certbot и включения HTTPS на NGINX мы будем полагаться на Python. Итак, прежде всего, давайте настроим виртуальную среду:

```bash
apt install python3.10-venv
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
```

2. После этого выполните эту команду для установки Certbot:

```bash
sudo /opt/certbot/bin/pip install certbot certbot-nginx
```

3. Теперь выполните следующую команду, чтобы убедиться, что команда `certbot` может быть запущена:

```bash
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

4. Наконец, выполните следующую команду для получения сертификата и позвольте Certbot автоматически изменить конфигурацию NGINX, включив HTTPS:

```bash
sudo certbot --nginx
```

5. После следования мастеру генерации сертификата мы сможем получить доступ к нашему Droplet через HTTPS, используя адрес https://yourdomain.com

### Настройка автоматического обновления

Чтобы позволить Certbot автоматически обновлять сертификаты, достаточно добавить cron job, выполнив следующую команду:

```bash
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

## Поздравляем!

Вы успешно настроили Flowise на вашем Droplet с SSL сертификатом на вашем домене [🥳](https://emojipedia.org/partying-face/)

## Шаги для обновления Flowise на Digital Ocean

1. Перейдите в каталог, где вы установили flowise

```bash
cd Flowise/docker
```

2. Остановите и удалите docker образ

Примечание: Это не удалит ваши потоки, поскольку база данных хранится в отдельной папке

```bash
sudo docker compose stop
sudo docker compose rm
```

3. Получите последний образ Flowise

Вы можете проверить последнюю версию релиза [здесь](https://github.com/FlowiseAI/Flowise/releases)

```bash
docker pull flowiseai/flowise
```

4. Запустите docker

```bash
docker compose up -d
```
