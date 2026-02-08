-- MIGRACIÓN V6: Expansión de Ramos (Business Logic SICAS)
-- Agregamos columnas para controlar IVA y Reglas de Renovación por Ramo

ALTER TABLE public.insurance_lines 
ADD COLUMN IF NOT EXISTS code TEXT, -- Código interno mejorado (ej. "VIDA-IND")
ADD COLUMN IF NOT EXISTS iva_applies BOOLEAN DEFAULT true, -- Si lleva IVA (SICAS: "IVA Si/No")
ADD COLUMN IF NOT EXISTS requires_renewal BOOLEAN DEFAULT true, -- Si requiere renovación (SICAS: "Renovación Si/No")
ADD COLUMN IF NOT EXISTS description TEXT; -- Para tooltips o ayuda

-- Index para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_insurance_lines_code ON public.insurance_lines(code);
