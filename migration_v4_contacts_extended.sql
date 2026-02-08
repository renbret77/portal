-- Migración: Extender tabla `clients` con más datos de contacto
-- Fecha: 2026-02-06
-- Autor: Antigravity

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
ADD COLUMN IF NOT EXISTS work_phone TEXT,
ADD COLUMN IF NOT EXISTS secondary_email TEXT;

-- Nota: `phone` original se puede mantener como "Teléfono Principal" o migrar. 
-- Por ahora lo mantenemos para compatibilidad regresiva.
