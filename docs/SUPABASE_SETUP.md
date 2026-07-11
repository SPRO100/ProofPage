# Подключение облачного Supabase-проекта

## 1. Создание проекта

1. Откройте [supabase.com](https://supabase.com) → **New project**.
2. Выберите регион ближайший к вашим пользователям (например, `eu-central-1` для Европы).
3. Запишите **Project URL** и **anon key** — они появятся сразу после создания.

## 2. Переменные окружения

```bash
cp .env.example .env.local
```

Заполните в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

`SUPABASE_SERVICE_ROLE_KEY` — в дашборде: **Project Settings → API → service_role**.

## 3. Установка Supabase CLI

```bash
npm install -g supabase
supabase login
```

## 4. Привязка к проекту

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` — часть URL после `https://` и до `.supabase.co`.

## 5. Применение миграций

```bash
supabase db push
```

Команда применяет все файлы из `supabase/migrations/` в порядке по имени.
Текущие миграции:

| Файл | Содержимое |
|------|-----------|
| `20260711000001_initial_schema.sql` | Таблицы, индексы, триггер `updated_at` |
| `20260711000002_rls_policies.sql` | RLS-политики для всех таблиц |
| `20260711000003_auth_trigger.sql` | Авто-создание профиля при регистрации |
| `20260711000004_free_plan_constraint.sql` | Ограничение 1 проекта для Free |

## 6. Загрузка тестовых данных (только для разработки)

```bash
supabase db reset --db-url postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres < supabase/seed.sql
```

Или через SQL-редактор в дашборде: откройте `supabase/seed.sql` и выполните.

Seed создаёт двух пользователей:

| Email | Пароль | Plan |
|-------|--------|------|
| `demo-free@proofpage.test` | `password123` | Free |
| `demo-pro@proofpage.test` | `password123` | Pro |

## 7. Настройка Auth

В дашборде **Authentication → URL Configuration**:

```
Site URL:       http://localhost:3000
Redirect URLs:  http://localhost:3000/auth/callback
                https://your-vercel-preview-url.vercel.app/auth/callback
                https://proofpage.io/auth/callback
```

Для OAuth (GitHub, Google) добавьте провайдеры в **Authentication → Providers**.

## 8. Проверка

```bash
# Убедитесь, что все таблицы созданы
supabase db diff --schema public
```

В дашборде **Table Editor** должны появиться:
`profiles`, `projects`, `revenue_sources`, `revenue_metrics`,
`subscriptions`, `profile_views`, `project_clicks`, `themes`

## Добавление новых миграций

```bash
# Создать новый файл миграции
supabase migration new your_migration_name

# Проверить diff перед применением
supabase db diff

# Применить
supabase db push
```

**Никогда не редактируйте схему напрямую в дашборде** — все изменения идут через миграции.
