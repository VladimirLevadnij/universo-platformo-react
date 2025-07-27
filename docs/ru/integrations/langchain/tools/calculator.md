---
description: Выполнение математических вычислений в ответах.
---

# Калькулятор

> **📋 Уведомление**: Данная документация основана на оригинальной документации Flowise и в настоящее время адаптируется для Universo Platformo React. Некоторые разделы могут все еще ссылаться на функциональность Flowise, которая еще не была полностью обновлена для специфичных возможностей Universo Platformo.

> **🔄 Статус перевода**: Этот документ переведен с английского языка и проходит процесс адаптации для русскоязычной аудитории. Если вы заметили неточности в переводе или терминологии, пожалуйста, создайте issue в репозитории.

<figure><img src="../../../.gitbook/assets/image (1) (1) (1) (1) (1) (1) (1) (1) (1) (1) (2).png" alt="" width="302"><figcaption><p>Узел калькулятора</p></figcaption></figure>

## Обзор

Инструмент "Калькулятор" позволяет агентам выполнять математические вычисления и решать арифметические задачи. Это один из наиболее часто используемых инструментов для агентов, которым необходимо работать с числовыми данными.

## Основные возможности

### 1. Арифметические операции
- **Сложение** (+): `2 + 3 = 5`
- **Вычитание** (-): `10 - 4 = 6`
- **Умножение** (*): `7 * 8 = 56`
- **Деление** (/): `15 / 3 = 5`
- **Возведение в степень** (**): `2 ** 3 = 8`
- **Остаток от деления** (%): `17 % 5 = 2`

### 2. Математические функции
- **Квадратный корень**: `sqrt(16) = 4`
- **Тригонометрические функции**: `sin(π/2) = 1`
- **Логарифмы**: `log(100) = 2`
- **Экспонента**: `exp(1) = 2.718...`
- **Абсолютное значение**: `abs(-5) = 5`

### 3. Константы
- **π (пи)**: `3.14159...`
- **e (число Эйлера)**: `2.71828...`
- **Бесконечность**: `inf`

## Настройка и использование

### Базовая конфигурация

```yaml
calculator:
  name: "Calculator"
  description: "Выполняет математические вычисления"
  enabled: true
  timeout: 10
  precision: 10  # Количество знаков после запятой
```

### Интеграция с агентом

```python
from langchain.agents import initialize_agent
from langchain.tools import Tool
from langchain.utilities import Calculator

# Создание инструмента калькулятора
calculator = Calculator()
calculator_tool = Tool(
    name="Calculator",
    description="Полезен для математических вычислений. Входные данные должны быть математическим выражением.",
    func=calculator.run
)

# Добавление к агенту
tools = [calculator_tool]
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent_type="zero-shot-react-description"
)
```

## Примеры использования

### 1. Простые арифметические операции

```python
# Пример диалога с агентом
user: "Сколько будет 25 * 4 + 17?"

agent_thought: "Мне нужно вычислить это математическое выражение."
action: Calculator
action_input: "25 * 4 + 17"
observation: "117"

agent_response: "25 * 4 + 17 = 117"
```

### 2. Сложные вычисления

```python
user: "Найди площадь круга с радиусом 7 метров"

agent_thought: "Площадь круга вычисляется по формуле π * r²"
action: Calculator  
action_input: "3.14159 * 7 ** 2"
observation: "153.93791"

agent_response: "Площадь круга с радиусом 7 метров составляет примерно 153.94 квадратных метра."
```

### 3. Финансовые расчеты

```python
user: "Если я инвестирую 1000 долларов под 5% годовых на 3 года, сколько получу?"

agent_thought: "Это расчет сложных процентов: A = P(1 + r)^t"
action: Calculator
action_input: "1000 * (1 + 0.05) ** 3"
observation: "1157.625"

agent_response: "При инвестировании 1000 долларов под 5% годовых на 3 года вы получите 1157.63 доллара."
```

### 4. Конвертация единиц измерения

```python
user: "Сколько секунд в неделе?"

agent_thought: "В неделе 7 дней, в дне 24 часа, в часе 60 минут, в минуте 60 секунд"
action: Calculator
action_input: "7 * 24 * 60 * 60"
observation: "604800"

agent_response: "В неделе 604,800 секунд."
```

## Продвинутые возможности

### 1. Работа с переменными

```python
# Калькулятор может работать с именованными переменными
expressions = {
    "revenue": "1000000",
    "costs": "750000", 
    "profit": "revenue - costs",
    "margin": "profit / revenue * 100"
}

for name, expr in expressions.items():
    result = calculator.run(expr)
    print(f"{name}: {result}")
```

### 2. Статистические функции

```python
# Расширенный калькулятор со статистическими функциями
import statistics

class AdvancedCalculator:
    def calculate(self, expression):
        # Базовые математические операции
        if any(op in expression for op in ['+', '-', '*', '/', '**']):
            return eval(expression)
        
        # Статистические функции
        if expression.startswith('mean('):
            data = self.parse_list(expression)
            return statistics.mean(data)
        
        if expression.startswith('median('):
            data = self.parse_list(expression)
            return statistics.median(data)
        
        if expression.startswith('stdev('):
            data = self.parse_list(expression)
            return statistics.stdev(data)
    
    def parse_list(self, expression):
        # Извлечение списка чисел из выражения
        content = expression[expression.find('(')+1:expression.find(')')]
        return [float(x.strip()) for x in content.split(',')]
```

### 3. Обработка ошибок

```python
class SafeCalculator:
    def __init__(self):
        self.max_result = 1e10  # Максимальный результат
        self.timeout = 5        # Таймаут в секундах
    
    def calculate(self, expression):
        try:
            # Валидация выражения
            if not self.is_safe_expression(expression):
                return "Ошибка: Небезопасное выражение"
            
            # Вычисление с таймаутом
            result = self.evaluate_with_timeout(expression)
            
            # Проверка размера результата
            if abs(result) > self.max_result:
                return "Ошибка: Результат слишком большой"
            
            return str(result)
            
        except ZeroDivisionError:
            return "Ошибка: Деление на ноль"
        except OverflowError:
            return "Ошибка: Переполнение"
        except SyntaxError:
            return "Ошибка: Неверный синтаксис"
        except Exception as e:
            return f"Ошибка: {str(e)}"
    
    def is_safe_expression(self, expression):
        # Проверка на опасные функции
        dangerous = ['import', 'exec', 'eval', '__', 'open', 'file']
        return not any(danger in expression.lower() for danger in dangerous)
```

## Интеграция с другими инструментами

### 1. Комбинация с поиском

```python
user: "Найди текущий курс доллара к евро и вычисли, сколько евро получится за 500 долларов"

# Агент использует поиск для получения курса
search_result: "1 USD = 0.85 EUR"

# Затем использует калькулятор
action: Calculator
action_input: "500 * 0.85"
observation: "425.0"

agent_response: "При текущем курсе 1 USD = 0.85 EUR, за 500 долларов вы получите 425 евро."
```

### 2. Работа с данными из файлов

```python
user: "Прочитай файл sales.csv и вычисли общую сумму продаж"

# Агент читает файл
file_content: "Product,Sales\nA,1000\nB,1500\nC,2000"

# Извлекает числа и суммирует
action: Calculator
action_input: "1000 + 1500 + 2000"
observation: "4500"

agent_response: "Общая сумма продаж составляет 4500."
```

## Лучшие практики

### 1. Форматирование выражений

```python
# Хорошо: четкие математические выражения
"2 + 3 * 4"
"sqrt(16) + log(100)"
"(1000 * 1.05) ** 3"

# Плохо: неясные или сложные выражения
"calculate the thing with numbers"
"do some math with these values"
```

### 2. Обработка больших чисел

```python
# Используйте научную нотацию для больших чисел
"1.5e6 * 2.3e4"  # Вместо 1500000 * 23000

# Округляйте результаты для читаемости
result = calculator.run("22 / 7")
formatted_result = round(float(result), 4)  # 3.1429
```

### 3. Валидация входных данных

```python
def validate_math_expression(expression):
    """Валидация математического выражения"""
    # Разрешенные символы
    allowed_chars = set('0123456789+-*/().** ')
    allowed_functions = ['sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'abs']
    
    # Проверка символов
    if not all(c in allowed_chars or c.isalpha() for c in expression):
        return False
    
    # Проверка функций
    for func in allowed_functions:
        expression = expression.replace(func, '')
    
    return True
```

## Мониторинг и отладка

### 1. Логирование вычислений

```python
import logging

class LoggedCalculator:
    def __init__(self):
        self.logger = logging.getLogger('calculator')
        self.calculation_history = []
    
    def calculate(self, expression):
        self.logger.info(f"Вычисление: {expression}")
        
        try:
            result = eval(expression)
            self.logger.info(f"Результат: {result}")
            
            # Сохранение в историю
            self.calculation_history.append({
                'expression': expression,
                'result': result,
                'timestamp': datetime.now()
            })
            
            return str(result)
            
        except Exception as e:
            self.logger.error(f"Ошибка вычисления: {e}")
            return f"Ошибка: {str(e)}"
```

### 2. Метрики производительности

```python
class CalculatorMetrics:
    def __init__(self):
        self.total_calculations = 0
        self.successful_calculations = 0
        self.error_count = 0
        self.average_execution_time = 0
    
    def record_calculation(self, success, execution_time):
        self.total_calculations += 1
        
        if success:
            self.successful_calculations += 1
        else:
            self.error_count += 1
        
        # Обновление среднего времени выполнения
        self.average_execution_time = (
            (self.average_execution_time * (self.total_calculations - 1) + execution_time) 
            / self.total_calculations
        )
    
    def get_success_rate(self):
        if self.total_calculations == 0:
            return 0
        return self.successful_calculations / self.total_calculations * 100
```

## Заключение

Инструмент "Калькулятор" является фундаментальным компонентом для создания агентов, способных работать с числовыми данными. Правильная настройка, валидация входных данных и обработка ошибок обеспечивают надежную работу математических вычислений в ваших AI-системах.

Ключевые моменты для успешного использования:
- **Четкие математические выражения** для лучшего понимания агентом
- **Валидация и безопасность** для предотвращения ошибок
- **Обработка исключений** для graceful degradation
- **Мониторинг и логирование** для отладки и оптимизации

{% hint style="info" %}
Для получения дополнительной помощи в настройке калькулятора, обратитесь к нашему [руководству по участию](broken-reference) или создайте issue в репозитории.
{% endhint %}
