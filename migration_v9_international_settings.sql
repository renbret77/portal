-- Migración v9: Soporte Internacional (Modo SaaS Global)
-- Agrega configuración regional a los perfiles de agente.

ALTER TABLE public.profiles 
ADD COLUMN country_code TEXT DEFAULT 'MX',
ADD COLUMN default_currency TEXT DEFAULT 'MXN';

COMMENT ON COLUMN public.profiles.country_code IS 'Código ISO del país (ej. MX, CO, ES) para lógica de telefonía';
COMMENT ON COLUMN public.profiles.default_currency IS 'Moneda principal del agente (ej. MXN, USD, EUR)';

-- Actualizar perfiles existentes a MXN/MX por defecto
UPDATE public.profiles SET country_code = 'MX', default_currency = 'MXN' WHERE country_code IS NULL;
