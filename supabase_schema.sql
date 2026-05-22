-- =====================================================================
-- MEDIGUARDIAN AI - COMPLETE DATABASE SCHEMA SETUP FOR SUPABASE
-- Run this directly in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================================

-- 1. DROP EXISTING TABLES AND TYPES (IF RESETTING)
-- Un-comment the following lines if you want a clean install:
/*
DROP TABLE IF EXISTS public.doctor_settings CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.medicine_logs CASCADE;
DROP TABLE IF EXISTS public.medicine_schedules CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.medicines CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.patient_connections CASCADE;
DROP TABLE IF EXISTS public.caregiver_profiles CASCADE;
DROP TABLE IF EXISTS public.doctor_profiles CASCADE;
DROP TABLE IF EXISTS public.patient_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.patient_vitals CASCADE;
DROP TABLE IF EXISTS public.health_reports CASCADE;
DROP TABLE IF EXISTS public.sos_logs CASCADE;
DROP TABLE IF EXISTS public.ai_insights CASCADE;
DROP TABLE IF EXISTS public.ai_verifications CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.health_status CASCADE;
DROP TYPE IF EXISTS public.connection_type CASCADE;
DROP TYPE IF EXISTS public.connection_status CASCADE;
DROP TYPE IF EXISTS public.appointment_type CASCADE;
DROP TYPE IF EXISTS public.appointment_status CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.notification_priority CASCADE;
DROP TYPE IF EXISTS public.prescription_status CASCADE;
DROP TYPE IF EXISTS public.medicine_schedule_status CASCADE;
DROP TYPE IF EXISTS public.medicine_frequency CASCADE;
DROP TYPE IF EXISTS public.medicine_instructions CASCADE;
DROP TYPE IF EXISTS public.medicine_log_status CASCADE;
DROP TYPE IF EXISTS public.log_actor CASCADE;
DROP TYPE IF EXISTS public.sos_status CASCADE;
DROP TYPE IF EXISTS public.insight_type CASCADE;
DROP TYPE IF EXISTS public.risk_level CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;
*/

-- 2. CREATE CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('PATIENT', 'DOCTOR', 'CAREGIVER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.health_status AS ENUM ('STABLE', 'NEEDS_ATTENTION', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.connection_type AS ENUM ('DOCTOR', 'CAREGIVER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.connection_status AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_type AS ENUM ('VIDEO', 'IN_PERSON');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM ('MISSED_MEDICINE', 'EMERGENCY', 'APPOINTMENT', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.notification_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.prescription_status AS ENUM ('ACTIVE', 'COMPLETED', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.medicine_schedule_status AS ENUM ('ACTIVE', 'PAUSED', 'STOPPED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.medicine_frequency AS ENUM ('DAILY', 'WEEKLY', 'AS_NEEDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.medicine_instructions AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.medicine_log_status AS ENUM ('TAKEN', 'MISSED', 'SKIPPED', 'PENDING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.log_actor AS ENUM ('PATIENT', 'CAREGIVER', 'SYSTEM_AUTO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.sos_status AS ENUM ('ACTIVE', 'RESOLVED', 'FALSE_ALARM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.insight_type AS ENUM ('ADHERENCE_RISK', 'DRUG_INTERACTION', 'VITAL_ANOMALY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_status AS ENUM ('SAFE', 'WARNING', 'DANGER', 'UNREADABLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 3. CREATE CORE TABLES

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email character varying(255) NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  last_login timestamp without time zone,
  is_active boolean DEFAULT true,
  role public.user_role NOT NULL DEFAULT 'PATIENT'::public.user_role,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);

-- PATIENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  mg_pat_id character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  date_of_birth date,
  blood_group character varying,
  health_status public.health_status DEFAULT 'STABLE'::public.health_status,
  adherence_score numeric DEFAULT 0,
  allergies jsonb,
  chronic_conditions jsonb,
  avatar_url character varying,
  CONSTRAINT patient_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT patient_profiles_mg_pat_id_key UNIQUE (mg_pat_id),
  CONSTRAINT patient_profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT patient_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- DOCTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name character varying,
  last_name character varying,
  specialization character varying,
  hospital_affiliation character varying,
  license_number character varying,
  is_verified boolean DEFAULT false,
  CONSTRAINT doctor_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT doctor_profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT doctor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- CAREGIVER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.caregiver_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  first_name character varying,
  last_name character varying,
  phone_number character varying,
  CONSTRAINT caregiver_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT caregiver_profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT caregiver_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- PATIENT CONNECTIONS TABLE (Connects Patients with Doctors/Caregivers)
CREATE TABLE IF NOT EXISTS public.patient_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  connected_user_id uuid,
  connection_type public.connection_type NOT NULL,
  status public.connection_status DEFAULT 'PENDING'::public.connection_status,
  permissions jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT patient_connections_pkey PRIMARY KEY (id),
  CONSTRAINT patient_connections_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT patient_connections_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- DOCTOR OPERATIONAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.doctor_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id uuid,
  consultation_available boolean DEFAULT true,
  emergency_pager boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT doctor_settings_pkey PRIMARY KEY (id),
  CONSTRAINT doctor_settings_doctor_id_key UNIQUE (doctor_id),
  CONSTRAINT doctor_settings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id) ON DELETE CASCADE
);

-- REMINDERS TABLE (Self-created patient medication reminders)
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  medicine_name character varying(255) NOT NULL,
  dosage character varying(100),
  reminder_time time without time zone,
  frequency character varying(100),
  reminder_type character varying(100) DEFAULT 'self'::character varying,
  status character varying(50) DEFAULT 'ACTIVE'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_pkey PRIMARY KEY (id),
  CONSTRAINT reminders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  doctor_id uuid,
  appointment_time timestamp without time zone,
  type public.appointment_type,
  status public.appointment_status DEFAULT 'SCHEDULED'::public.appointment_status,
  meeting_link character varying,
  clinical_notes character varying,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type public.notification_type,
  title character varying,
  body character varying,
  priority public.notification_priority DEFAULT 'LOW'::public.notification_priority,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- 4. CLINICAL & HEALTH METRIC TABLES

-- MEDICINES INDEX TABLE (Standard Catalog)
CREATE TABLE IF NOT EXISTS public.medicines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  generic_name character varying,
  type character varying,
  manufacturer character varying,
  CONSTRAINT medicines_pkey PRIMARY KEY (id)
);

-- PRESCRIPTIONS TABLE (Clinical Prescription Header)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  doctor_id uuid,
  diagnosis character varying,
  status public.prescription_status DEFAULT 'ACTIVE'::public.prescription_status,
  valid_until timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- MEDICINE SCHEDULES TABLE (Active drug schedule timelines)
CREATE TABLE IF NOT EXISTS public.medicine_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  prescription_id uuid,
  medicine_name character varying,
  is_self_reminder boolean DEFAULT false,
  dosage character varying,
  frequency public.medicine_frequency,
  timing_slots jsonb,
  instructions public.medicine_instructions,
  start_date date,
  end_date date,
  requires_refill boolean DEFAULT false,
  refill_date date,
  status public.medicine_schedule_status DEFAULT 'ACTIVE'::public.medicine_schedule_status,
  CONSTRAINT medicine_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT medicine_schedules_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT medicine_schedules_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE SET NULL
);

-- MEDICINE LOGS TABLE (Intake history tracking)
CREATE TABLE IF NOT EXISTS public.medicine_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  patient_id uuid,
  scheduled_time timestamp without time zone,
  taken_time timestamp without time zone,
  status public.medicine_log_status DEFAULT 'PENDING'::public.medicine_log_status,
  logged_by public.log_actor,
  CONSTRAINT medicine_logs_pkey PRIMARY KEY (id),
  CONSTRAINT medicine_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT medicine_logs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.medicine_schedules(id) ON DELETE CASCADE
);

-- PATIENT VITALS TABLE
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  recorded_at timestamp without time zone DEFAULT now(),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  blood_sugar numeric,
  heart_rate integer,
  temperature numeric,
  CONSTRAINT patient_vitals_pkey PRIMARY KEY (id),
  CONSTRAINT patient_vitals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- HEALTH REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.health_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  uploaded_by uuid,
  title character varying,
  report_type character varying,
  file_url character varying,
  ai_summary character varying,
  CONSTRAINT health_reports_pkey PRIMARY KEY (id),
  CONSTRAINT health_reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT health_reports_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- SOS LOGS TABLE
CREATE TABLE IF NOT EXISTS public.sos_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  triggered_at timestamp without time zone DEFAULT now(),
  location_lat numeric,
  location_lng numeric,
  status public.sos_status DEFAULT 'ACTIVE'::public.sos_status,
  resolved_by uuid,
  CONSTRAINT sos_logs_pkey PRIMARY KEY (id),
  CONSTRAINT sos_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT sos_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- AI INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  insight_type public.insight_type,
  risk_level public.risk_level,
  description character varying,
  recommendation character varying,
  is_acknowledged boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_insights_pkey PRIMARY KEY (id),
  CONSTRAINT ai_insights_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- AI VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid,
  image_url character varying,
  extracted_medicine_name character varying,
  verification_status public.verification_status,
  interaction_warnings jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT ai_verifications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);


-- =====================================================================
-- 5. SEED DATA (DOCTOR & PATIENT LOGINS & PROFILES)
-- =====================================================================

-- Seed users
INSERT INTO public.users (id, email, role, is_active) VALUES
('00000000-0000-0000-0000-000000100001', 'dr.rajesh.kumar@apollo.in', 'DOCTOR', true),
('00000000-0000-0000-0000-000000100002', 'dr.priya.sharma@fortis.in', 'DOCTOR', true),
('00000000-0000-0000-0000-000000100005', 'dr.sanjay.gupta@aiims.edu', 'DOCTOR', true),
('00000000-0000-0000-0000-000000100006', 'dr.kavya.rao@narayana.in', 'DOCTOR', true),

('00000000-0000-0000-0000-000000200001', 'amit.patel@email.in', 'PATIENT', true),
('00000000-0000-0000-0000-000000200002', 'sneha.desai@email.in', 'PATIENT', true),
('00000000-0000-0000-0000-000000200005', 'ramesh.iyer@email.in', 'PATIENT', true),
('00000000-0000-0000-0000-000000200006', 'aditi.singh@email.in', 'PATIENT', true),

('00000000-0000-0000-0000-000000300001', 'suresh.patel@email.in', 'CAREGIVER', true),
('00000000-0000-0000-0000-000000300005', 'sunita.iyer@email.in', 'CAREGIVER', true)
ON CONFLICT (id) DO NOTHING;

-- Seed doctor profiles
INSERT INTO public.doctor_profiles (id, user_id, first_name, last_name, specialization, hospital_affiliation, license_number, is_verified) VALUES
('00000000-0000-0000-0000-000000400001', '00000000-0000-0000-0000-000000100001', 'Rajesh', 'Kumar', 'Cardiology', 'Apollo Hospitals, Bangalore', 'KMC10234', true),
('00000000-0000-0000-0000-000000400002', '00000000-0000-0000-0000-000000100002', 'Priya', 'Sharma', 'Endocrinology', 'Fortis Healthcare, Mumbai', 'MMC56789', true),
('00000000-0000-0000-0000-000000400005', '00000000-0000-0000-0000-000000100005', 'Sanjay', 'Gupta', 'Cardiology', 'AIIMS, New Delhi', 'DMC11223', true),
('00000000-0000-0000-0000-000000400006', '00000000-0000-0000-0000-000000100006', 'Kavya', 'Rao', 'Pediatrics', 'Narayana Health, Bangalore', 'KMC99887', true)
ON CONFLICT (id) DO NOTHING;

-- Seed patient profiles
INSERT INTO public.patient_profiles (id, user_id, mg_pat_id, first_name, last_name, date_of_birth, blood_group, health_status, adherence_score, allergies, chronic_conditions) VALUES
('00000000-0000-0000-0000-000000600001', '00000000-0000-0000-0000-000000200001', 'MG-PAT-1001', 'Amit', 'Patel', '1965-04-12', 'O+', 'STABLE', 85.00, '["Dust", "Pollen"]', '["Hypertension"]'),
('00000000-0000-0000-0000-000000600002', '00000000-0000-0000-0000-000000200002', 'MG-PAT-1002', 'Sneha', 'Desai', '1978-09-25', 'A+', 'STABLE', 92.00, '["Penicillin"]', '["Type 2 Diabetes"]'),
('00000000-0000-0000-0000-000000600005', '00000000-0000-0000-0000-000000200005', 'MG-PAT-3001', 'Ramesh', 'Iyer', '1958-11-20', 'B+', 'STABLE', 88.00, '["Aspirin"]', '["Coronary Artery Disease"]'),
('00000000-0000-0000-0000-000000600006', '00000000-0000-0000-0000-000000200006', 'MG-PAT-3002', 'Aditi', 'Singh', '2015-06-14', 'O+', 'STABLE', 95.00, '["Dust Mites"]', '["Asthma"]')
ON CONFLICT (id) DO NOTHING;

-- Seed caregiver profiles
INSERT INTO public.caregiver_profiles (id, user_id, first_name, last_name, phone_number) VALUES
('00000000-0000-0000-0000-000000500001', '00000000-0000-0000-0000-000000300001', 'Suresh', 'Patel', '+919876543210'),
('00000000-0000-0000-0000-000000500005', '00000000-0000-0000-0000-000000300005', 'Sunita', 'Iyer', '+919888877777')
ON CONFLICT (id) DO NOTHING;

-- Seed doctor-patient-caregiver connections
INSERT INTO public.patient_connections (patient_id, connected_user_id, connection_type, status) VALUES
('00000000-0000-0000-0000-000000600001', '00000000-0000-0000-0000-000000100001', 'DOCTOR', 'ACTIVE'),
('00000000-0000-0000-0000-000000600001', '00000000-0000-0000-0000-000000300001', 'CAREGIVER', 'ACTIVE'),
('00000000-0000-0000-0000-000000600005', '00000000-0000-0000-0000-000000100005', 'DOCTOR', 'ACTIVE'),
('00000000-0000-0000-0000-000000600005', '00000000-0000-0000-0000-000000300005', 'CAREGIVER', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Seed doctor operational settings
INSERT INTO public.doctor_settings (id, doctor_id, consultation_available, emergency_pager, push_notifications) VALUES
('00000000-0000-0000-0000-000000450001', '00000000-0000-0000-0000-000000400001', true, true, true),
('00000000-0000-0000-0000-000000450002', '00000000-0000-0000-0000-000000400002', true, false, true),
('00000000-0000-0000-0000-000000450005', '00000000-0000-0000-0000-000000400005', true, true, true),
('00000000-0000-0000-0000-000000450006', '00000000-0000-0000-0000-000000400006', true, false, false)
ON CONFLICT (id) DO NOTHING;


-- =====================================================================
-- 6. SECURITY & PERMISSIONS (ROW LEVEL SECURITY)
-- =====================================================================

-- To guarantee fast client-side querying in the dashboard:
-- Disable RLS across core tables, OR grant full read-write privileges to anon, authenticated and service_role.

ALTER TABLE IF EXISTS public.patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.caregiver_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medicine_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medicine_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sos_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_verifications DISABLE ROW LEVEL SECURITY;

-- Grant Full Privileges (standard practice for developer bypass in hackathons)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
