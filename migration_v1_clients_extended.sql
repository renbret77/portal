-- MIGRACIÓN V1: Extender tabla de clientes (Formulario Avanzado)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'fisica' CHECK (type IN ('fisica', 'moral')),
ADD COLUMN IF NOT EXISTS rfc TEXT,
ADD COLUMN IF NOT EXISTS curp TEXT,
ADD COLUMN IF NOT EXISTS fiscal_regime TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS additional_emails JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_phones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Actualizar comentarios para documentación (opcional pero recomendado)
COMMENT ON COLUMN public.clients.type IS 'Tipo de persona: fisica o moral';
COMMENT ON COLUMN public.clients.additional_emails IS 'Lista de correos adicionales en formato JSON';
