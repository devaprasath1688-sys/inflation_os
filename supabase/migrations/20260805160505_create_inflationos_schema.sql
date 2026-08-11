/*
# InflationOS — Core financial intelligence schema

## Overview
Creates the multi-user data model for the InflationOS financial intelligence platform.
Each user owns a single financial profile (their onboarding data), plus goals,
notifications, and AI chat messages — all scoped to the authenticated user.

## New Tables
1. `profiles` — display name + onboarding completion flag, 1:1 with auth.users
   - `id` (uuid PK, = auth.users.id)
   - `display_name` (text)
   - `onboarded` (bool, default false)
   - `created_at`, `updated_at`

2. `financial_profiles` — the full onboarding payload (career, family, lifestyle,
   expenses, savings, goals summary) stored as JSONB for flexibility. One row per user.
   - `id` (uuid PK)
   - `user_id` (uuid, DEFAULT auth.uid(), FK auth.users, unique)
   - `data` (jsonb) — the complete onboarding document
   - `created_at`, `updated_at`

3. `goals` — individual financial goals with progress tracking
   - `id` (uuid PK)
   - `user_id` (uuid, DEFAULT auth.uid(), FK auth.users)
   - `title` (text)
   - `target_amount` (numeric)
   - `current_amount` (numeric, default 0)
   - `deadline` (date)
   - `category` (text)
   - `created_at`

4. `notifications` — in-app notification center
   - `id` (uuid PK)
   - `user_id` (uuid, DEFAULT auth.uid(), FK auth.users)
   - `title` (text)
   - `body` (text)
   - `type` (text) — e.g. salary, budget, investment, emergency, goal
   - `priority` (text) — high/medium/low
   - `read` (bool, default false)
   - `created_at`

5. `chat_messages` — AI assistant conversation history
   - `id` (uuid PK)
   - `user_id` (uuid, DEFAULT auth.uid(), FK auth.users)
   - `role` (text) — user / assistant
   - `content` (text)
   - `created_at`

## Security
- RLS enabled on every table.
- 4 CRUD policies per table, all scoped `TO authenticated` with `auth.uid()` ownership checks.
- `user_id` columns default to `auth.uid()` so inserts that omit the owner still pass WITH CHECK.
- `profiles.id` defaults to `auth.uid()` and is the row identity for ownership.
- updated_at auto-maintained via triggers.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- financial_profiles
CREATE TABLE IF NOT EXISTS financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_financial_profile" ON financial_profiles;
CREATE POLICY "select_own_financial_profile" ON financial_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_financial_profile" ON financial_profiles;
CREATE POLICY "insert_own_financial_profile" ON financial_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_financial_profile" ON financial_profiles;
CREATE POLICY "update_own_financial_profile" ON financial_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_financial_profile" ON financial_profiles;
CREATE POLICY "delete_own_financial_profile" ON financial_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  deadline date,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat_messages" ON chat_messages;
CREATE POLICY "select_own_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat_messages" ON chat_messages;
CREATE POLICY "insert_own_chat_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_chat_messages" ON chat_messages;
CREATE POLICY "update_own_chat_messages" ON chat_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat_messages" ON chat_messages;
CREATE POLICY "delete_own_chat_messages" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS financial_profiles_touch_updated_at ON financial_profiles;
CREATE TRIGGER financial_profiles_touch_updated_at BEFORE UPDATE ON financial_profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- indexes
CREATE INDEX IF NOT EXISTS idx_financial_profiles_user_id ON financial_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
