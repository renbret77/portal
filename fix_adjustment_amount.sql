-- FIX: Missing adjustment_amount column
-- Execute this snippet in your Supabase SQL Editor if you are getting errors saving policies

ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS adjustment_amount DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN public.policies.adjustment_amount IS 'Ajuste manual para cuadre de centavos o redondeos financieras';
