/*
# JALNETRA AI — Core Schema

1. New Tables
- `profiles`: user profile data (name, phone, role) linked to auth.users
- `predictions`: saved AI field predictions per user
- `district_stress_data`: seeded district-level moisture stress data for the map
2. Security
- RLS enabled on all tables
- profiles: owner-scoped CRUD (authenticated, auth.uid() = id)
- predictions: owner-scoped CRUD (authenticated, auth.uid() = user_id)
- district_stress_data: public read (anon + authenticated), no writes from client
3. Notes
- profiles.id references auth.users.id with ON DELETE CASCADE
- predictions.user_id defaults to auth.uid() so client inserts omit it
- district_stress_data is read-only from the client; seeded via this migration
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text DEFAULT 'farmer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  state text NOT NULL,
  district text NOT NULL,
  village text,
  crop text NOT NULL,
  sowing_date date,
  area_acres numeric,
  health_score numeric,
  stress_level text,
  confidence numeric,
  water_deficit_mm numeric,
  growth_stage text,
  irrigation_date date,
  advisory text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_predictions" ON predictions;
CREATE POLICY "select_own_predictions" ON predictions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_predictions" ON predictions;
CREATE POLICY "insert_own_predictions" ON predictions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_predictions" ON predictions;
CREATE POLICY "update_own_predictions" ON predictions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_predictions" ON predictions;
CREATE POLICY "delete_own_predictions" ON predictions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);

-- DISTRICT STRESS DATA TABLE (public read, seeded)
CREATE TABLE IF NOT EXISTS district_stress_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_name text NOT NULL,
  state_name text NOT NULL,
  dominant_crop text NOT NULL,
  stress_pct numeric NOT NULL,
  stress_level text NOT NULL,
  water_deficit_mm numeric NOT NULL,
  ndvi_trend jsonb NOT NULL DEFAULT '[]',
  crop_breakdown jsonb NOT NULL DEFAULT '[]',
  advisory text,
  latitude numeric,
  longitude numeric,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE district_stress_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_district_stress" ON district_stress_data;
CREATE POLICY "read_district_stress" ON district_stress_data FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_district_stress_state ON district_stress_data(state_name);
CREATE INDEX IF NOT EXISTS idx_district_stress_level ON district_stress_data(stress_level);
