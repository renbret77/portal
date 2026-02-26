-- Migración v8: Gestión de Recibos y Cobros Inteligentes
-- Agrega soporte para seguimiento de cuotas (recibo X de Y) y líneas de pago.

ALTER TABLE public.policies 
ADD COLUMN total_installments INTEGER DEFAULT 1,
ADD COLUMN current_installment INTEGER DEFAULT 1,
ADD COLUMN payment_link TEXT,
ADD COLUMN is_domiciled BOOLEAN DEFAULT false;

-- Comentarios para documentación
COMMENT ON COLUMN public.policies.total_installments IS 'Total de recibos que componen la póliza (ej. 12 para mensual)';
COMMENT ON COLUMN public.policies.current_installment IS 'Número del recibo actual que se está cobrando';
COMMENT ON COLUMN public.policies.payment_link IS 'URL de la línea de captura o portal de pago de la aseguradora';
COMMENT ON COLUMN public.policies.is_domiciled IS 'Indica si el cobro es automático a tarjeta';
