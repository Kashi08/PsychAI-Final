-- ============================================================
-- PsychAI Psychologist App   Additional Database Schema
-- Run this in Supabase SQL Editor AFTER the patient schema.sql
-- ============================================================

-- ── Psychologist profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS psychologist_profiles (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  clinic_name   TEXT,
  license_number TEXT,
  access_code   TEXT UNIQUE NOT NULL,
  push_token    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE psychologist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Psych sees own profile" ON psychologist_profiles FOR ALL USING (auth.uid() = user_id);

-- ── Patient–psychologist links ──────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_links (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  psychologist_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  consent_given    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, psychologist_id)
);

ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Link access" ON patient_links FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

-- ── Session notes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_notes (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  psychologist_id  UUID REFERENCES auth.users(id) NOT NULL,
  patient_id       UUID REFERENCES auth.users(id) NOT NULL,
  content          TEXT NOT NULL,
  phq9_score       INTEGER,
  gad7_score       INTEGER,
  risk_level       TEXT CHECK (risk_level IN ('LOW','MED','HIGH')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes by psych" ON session_notes FOR ALL USING (auth.uid() = psychologist_id);

-- ── Sessions / appointments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  psychologist_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_mins    INTEGER DEFAULT 50,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled')),
  session_type     TEXT DEFAULT 'Individual therapy',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session access" ON sessions FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

-- ── Psychologist messages to patients ───────────────────────────
CREATE TABLE IF NOT EXISTS psych_messages (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id        UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id      UUID REFERENCES auth.users(id) NOT NULL,
  content          TEXT NOT NULL,
  read             BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE psych_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Message access" ON psych_messages FOR ALL
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================================
-- Demo psychologist account seed
-- ============================================================
-- Step 1: Go to Supabase > Authentication > Users > Add user
--   Email:    psych@psychai.app
--   Password: PsychAI@Doctor2024
-- Step 2: Copy the UUID, replace PSYCH_USER_UUID_HERE below
-- Step 3: Run this SQL

DO $$
DECLARE
  psych_uid UUID := 'PSYCH_USER_UUID_HERE';
BEGIN
  INSERT INTO psychologist_profiles (user_id, full_name, clinic_name, license_number, access_code)
  VALUES (
    psych_uid,
    'Dr. Namrata Sharma',
    'SRM University Mental Health Centre',
    'MH-DL-2021-0042',
    'DR-DEMO-2024'
  )
  ON CONFLICT (user_id) DO NOTHING;
END $$;
