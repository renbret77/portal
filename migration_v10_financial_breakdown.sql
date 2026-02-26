-- Migración v10: Desglose Financiero Detallado
-- Agrega campos técnicos para el cálculo de primas, impuestos y recargos.

ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS policy_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS surcharge_percentage DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS surcharge_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS extra_premium DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 16.00, -- IVA por defecto en MX
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN public.policies.policy_fee IS 'Derecho de póliza (Gasto de emisión)';
COMMENT ON COLUMN public.policies.surcharge_amount IS 'Monto total por recargo financiero';
COMMENT ON COLUMN public.policies.extra_premium IS 'Sobreprima por riesgos adicionales';
COMMENT ON COLUMN public.policies.vat_amount IS 'Monto calculado de IVA';
