-- MIGRACIÓN V2: Perfil 360 - Datos "Vida Real" para Seguros
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.clients
-- 1. Relaciones y Contactos (El caso Juan/Pepe)
-- Estructura: [{ name: "Juan", relation: "Padre", type: "payer", email: "...", notify: true }]
ADD COLUMN IF NOT EXISTS related_contacts JSONB DEFAULT '[]'::jsonb,

-- 2. Domicilios Múltiples (Riesgo vs Fiscal)
-- Estructura: [{ type: "fiscal", street: "Reforma", zip: "06600", city: "CDMX" }, { type: "risk", ... }]
ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb,

-- 3. Identificación y PLD (Prevención Lavado Dinero)
-- Estructura: [{ type: "ine", number: "123", expires: "2030" }]
ADD COLUMN IF NOT EXISTS identifications JSONB DEFAULT '[]'::jsonb,

-- 4. Información Bancaria / Cobranza (Segura, no full numbers)
-- Estructura: [{ bank: "BBVA", last4: "1234", type: "debit" }]
ADD COLUMN IF NOT EXISTS billing_info JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.clients.related_contacts IS 'Padres, Hijos, Socios, Beneficiarios';
COMMENT ON COLUMN public.clients.addresses IS 'Fiscal, Correspondencia, Ubicación de Riesgo';
