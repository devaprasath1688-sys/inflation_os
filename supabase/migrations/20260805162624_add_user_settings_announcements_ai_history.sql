/*
# InflationOS — User settings, admin roles, announcements

## New Tables
1. `user_settings` — per-user preferences (theme, language, currency, notifications, privacy)
   - `id` uuid PK DEFAULT auth.uid()
   - `user_id` uuid UNIQUE DEFAULT auth.uid() FK auth.users
   - `theme` text (light/dark)
   - `language` text
   - `currency` text
   - `email_notifications` boolean
   - `push_notifications` boolean
   - `budget_alerts` boolean
   - `goal_milestones` boolean
   - `privacy_mode` boolean
   - `created_at`, `updated_at`

2. `announcements` — admin-published platform announcements
   - `id` uuid PK
   - `title` text
   - `body` text
   - `type` text (info/warning/success)
   - `active` boolean
   - `created_at`

3. `ai_history` — AI assistant conversation logs with metadata
   - `id` uuid PK
   - `user_id` uuid DEFAULT auth.uid() FK auth.users
   - `query` text
   - `response` text
   - `context` jsonb
   - `created_at`

## Security
- RLS on user_settings + ai_history scoped to authenticated owner
- announcements: readable by all authenticated, writable by service role only (admin)
- user_settings.user_id defaults to auth.uid()
*/

-- user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme text NOT NULL DEFAULT 'dark',
  language text NOT NULL DEFAULT 'English',
  currency text NOT NULL DEFAULT 'INR',
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  budget_alerts boolean NOT NULL DEFAULT true,
  goal_milestones boolean NOT NULL DEFAULT true,
  privacy_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_announcements" ON announcements;
CREATE POLICY "read_announcements" ON announcements FOR SELECT
  TO authenticated USING (true);
-- Only service role (admin) can write — no INSERT/UPDATE/DELETE policies for authenticated

-- ai_history
CREATE TABLE IF NOT EXISTS ai_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  response text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_history" ON ai_history;
CREATE POLICY "select_own_ai_history" ON ai_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_history" ON ai_history;
CREATE POLICY "insert_own_ai_history" ON ai_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_history" ON ai_history;
CREATE POLICY "delete_own_ai_history" ON ai_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- triggers
DROP TRIGGER IF EXISTS user_settings_touch_updated_at ON user_settings;
CREATE TRIGGER user_settings_touch_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active);
