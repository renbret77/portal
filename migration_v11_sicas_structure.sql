-- Migración v11: Estructura SICAS - Comisiones, Honorarios y Recargos Detallados
-- Esta migración añade la capacidad de rastrear la rentabilidad por póliza y ajustes manuales.

ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(10, 4) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS fees_percentage DECIMAL(10, 4) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS fees_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS adjustment_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS premium_subtotal DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN public.policies.commission_amount IS 'Monto de comisión pactada con la aseguradora';
COMMENT ON COLUMN public.policies.fees_amount IS 'Honorarios adicionales cobrados al cliente';
COMMENT ON COLUMN public.policies.adjustment_amount IS 'Ajuste manual para cuadre de centavos o redondeos';
COMMENT ON COLUMN public.policies.premium_subtotal IS 'Suma de (Neta + Derecho + Recargos + Sobreprima - Descuento) antes de IVA';

-- Tabla para el desglose de recibos individuales (Edición Manual SICAS style)
CREATE TABLE IF NOT EXISTS public.policy_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    premium_net DECIMAL(10, 2) DEFAULT 0.00,
    policy_fee DECIMAL(10, 2) DEFAULT 0.00,
    surcharges DECIMAL(10, 2) DEFAULT 0.00,
    vat_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Cobrado, Vencido
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.policy_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agentes pueden ver sus recibos" ON public.policy_installments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.policies p 
            WHERE p.id = policy_installments.policy_id 
            AND p.user_id = auth.uid()
        )
    );
