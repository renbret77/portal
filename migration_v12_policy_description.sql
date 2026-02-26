-- Migración v12: Campo de descripción para pólizas
-- Añade un campo para detalles del bien asegurado (ej. Jetta 2024 GL)

ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.policies.description IS 'Descripción detallada del bien asegurado (Vehículo, Inmueble, etc)';
