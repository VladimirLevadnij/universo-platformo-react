# Пакет MMOOMM Template

> **📦 Пакет**: `@universo/template-mmoomm`  
> **🏗️ Архитектура**: Модульная система шаблонов для MMOOMM функциональности  
> **🎯 Назначение**: Переиспользуемая генерация MMOOMM шаблонов для PlayCanvas и других 3D технологий

Пакет MMOOMM Template - это выделенный workspace пакет, который предоставляет модульную, переиспользуемую генерацию шаблонов для MMOOMM (Massively Multiplayer Online Object-Oriented Metaverse) функциональности. Этот пакет был извлечен из приложения `publish-frt` для улучшения модульности и продвижения переиспользования кода.

## Обзор пакета

### Архитектура

```
@universo/template-mmoomm/
├── src/
│   ├── playcanvas/           # PlayCanvas-специфичные реализации
│   │   ├── builders/         # Генераторы шаблонов
│   │   ├── handlers/         # Обработчики узлов
│   │   ├── multiplayer/      # Поддержка Colyseus мультиплеера
│   │   ├── generators/       # Генераторы кода
│   │   ├── scripts/          # Встроенные игровые скрипты
│   │   └── utils/            # PlayCanvas утилиты
│   ├── common/               # Общие утилиты и типы
│   └── i18n/                 # Интернационализация
└── dist/                     # Скомпилированный вывод (CJS/ESM)
```

### Система сборки

Пакет имеет **двойную систему сборки**, поддерживающую как CommonJS, так и ES Modules:

-   **CommonJS**: `dist/cjs/` - Для Node.js окружений
-   **ES Modules**: `dist/esm/` - Для современных бандлеров и браузеров
-   **TypeScript**: `dist/types/` - Определения типов для разработки

### Ключевые возможности

-   **Модульная система шаблонов**: Организована по технологиям (PlayCanvas) с расширяемой архитектурой
-   **Поддержка мультиплеера**: Интегрированная архитектура клиент-сервер Colyseus
-   **Интеграция UPDL**: Полная поддержка обработки UPDL потоков и извлечения объектов
-   **Типобезопасность**: Полная поддержка TypeScript с общими определениями типов
-   **Интернационализация**: Встроенная поддержка i18n для множественных языков

## Реализация PlayCanvas

### Генераторы

PlayCanvas генераторы предоставляют генерацию шаблонов для MMOOMM игр:

#### PlayCanvasMMOOMMBuilder

Основной класс генератора, который создает полные MMOOMM игровые впечатления:

```typescript
import { PlayCanvasMMOOMMBuilder } from '@universo/template-mmoomm'

const builder = new PlayCanvasMMOOMMBuilder()
const html = builder.build(flowData, options)
```

**Возможности:**

-   **Одиночный режим**: Традиционный MMOOMM геймплей с управлением кораблем, добычей и торговлей
-   **Мультиплеер режим**: Мультиплеер на основе Colyseus с синхронизацией в реальном времени
-   **Интеграция UPDL**: Обрабатывает UPDL потоки для извлечения игровых объектов и конфигураций
-   **Управление сущностями**: Обрабатывает корабли, станции, астероиды и ворота с правильной физикой

### Обработчики

Обработчики узлов обрабатывают UPDL узлы и конвертируют их в игровые объекты:

-   **SpaceHandler**: Обрабатывает Space узлы для создания сцен
-   **EntityHandler**: Обрабатывает Entity узлы (корабли, станции и т.д.)
-   **ComponentHandler**: Обрабатывает Component узлы для игровых механик
-   **DataHandler**: Управляет Data узлами для игрового состояния

### Поддержка мультиплеера

Интегрированная система мультиплеера Colyseus:

#### Интеграция клиента

```typescript
// Встроено в сгенерированный HTML
const client = new Colyseus.Client(serverUrl)
const room = await client.joinOrCreate('mmoomm')
```

#### Архитектура сервера

-   **MMOOMMRoom**: Основная игровая комната с управлением игроками
-   **PlayerSchema**: Синхронизация состояния игрока
-   **EntitySchema**: Управление состоянием игровых объектов
-   **Обновления в реальном времени**: Синхронизация трансформаций, добычи и торговли

### Генераторы

Генераторы кода создают финальный HTML и JavaScript:

-   **HTML Generator**: Создает полный HTML документ со встроенными скриптами
-   **JavaScript Generator**: Генерирует игровую логику и интеграцию UPDL
-   **Multiplayer Generator**: Создает код интеграции клиента Colyseus

## Интеграция с publish-frt

Приложение `publish-frt` использует этот пакет как зависимость:

### Зависимости пакета

```json
{
    "dependencies": {
        "@universo/template-mmoomm": "workspace:*"
    }
}
```

### Использование в publish-frt

```typescript
// В publish-frt генераторах
import { PlayCanvasMMOOMMBuilder } from '@universo/template-mmoomm'

export class PlayCanvasBuilder extends AbstractTemplateBuilder {
    async build(flowData: any, options: BuildOptions): Promise<string> {
        const mmoommBuilder = new PlayCanvasMMOOMMBuilder()
        return mmoommBuilder.build(flowData, options)
    }
}
```

## Разработка

### Сборка пакета

```bash
# Сборка всех форматов
pnpm build

# Сборка конкретных форматов
pnpm build:cjs    # CommonJS
pnpm build:esm    # ES Modules
pnpm build:types  # TypeScript определения
```

### Режим разработки

```bash
# Режим наблюдения для разработки
pnpm dev
```

### Линтинг

```bash
# Проверка качества кода
pnpm lint

# Автоисправление проблем
pnpm lint:fix
```

## Справочник API

### Основные экспорты

```typescript
// Основная точка входа пакета
export * from './playcanvas'
export * from './common'

// Ключевые интерфейсы
export type { ITemplateBuilder, BuildOptions, ProcessedGameData } from './common/types'
```

### PlayCanvas экспорты

```typescript
// Генераторы
export { PlayCanvasMMOOMMBuilder } from './builders/PlayCanvasMMOOMMBuilder'

// Обработчики
export { SpaceHandler } from './handlers/SpaceHandler'
export { EntityHandler } from './handlers/EntityHandler'
export { ComponentHandler } from './handlers/ComponentHandler'

// Мультиплеер
export { MMOOMMRoom } from './multiplayer/MMOOMMRoom'
export { PlayerSchema } from './multiplayer/schemas/PlayerSchema'

// Утилиты
export { UPDLProcessor } from './utils/UPDLProcessor'
```

## Миграция из publish-frt

Этот пакет был извлечен из приложения `publish-frt` для улучшения модульности:

### До (Монолитный)

```
publish-frt/
├── src/builders/templates/mmoomm/playcanvas/
│   ├── PlayCanvasMMOOMMBuilder.ts
│   ├── handlers/
│   └── multiplayer/
```

### После (Модульный)

```
publish-frt/                    # Потребитель
└── package.json
    └── "@universo/template-mmoomm": "workspace:*"

template-mmoomm/                # Поставщик
└── src/
    ├── playcanvas/
    ├── common/
    └── i18n/
```

### Преимущества

-   **Переиспользование**: Шаблон может использоваться другими приложениями
-   **Поддерживаемость**: Четкое разделение ответственности
-   **Тестирование**: Изолированное тестирование функциональности шаблона
-   **Версионирование**: Независимое версионирование функций шаблона

## Будущие расширения

Модульная архитектура позволяет легко расширять:

### Дополнительные технологии

-   **Three.js**: WebGL-базированный 3D рендеринг
-   **Babylon.js**: Интеграция игрового движка
-   **A-Frame**: Поддержка VR/AR

### Расширенные функции

-   **Продвинутая физика**: Более сложная симуляция физики
-   **Интеграция ИИ**: Поведение NPC и поиск пути
-   **Пользовательские шейдеры**: Продвинутые визуальные эффекты
-   **Мобильная оптимизация**: Сенсорное управление и производительность

## Вклад в разработку

При вкладе в пакет шаблона:

1. **Поддерживайте модульность**: Держите технологически-специфичный код в соответствующих директориях
2. **Типобезопасность**: Убедитесь, что все экспорты имеют правильные TypeScript определения
3. **Тестирование**: Добавляйте тесты для новых функций шаблона
4. **Документация**: Обновляйте этот README для новой функциональности
5. **Обратная совместимость**: Поддерживайте совместимость с существующими потребителями
