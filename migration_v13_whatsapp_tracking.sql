-- Migración v13: Seguimiento de Notificaciones WhatsApp
-- Añade campos para rastrear el estatus de los envíos de recordatorios.

ALTER TABLE public.policy_installments 
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_notification_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'Pendiente' CHECK (whatsapp_status IN ('Pendiente', 'Enviado', 'Fallido'));

COMMENT ON COLUMN public.policy_installments.whatsapp_sent IS 'Indica si se ha enviado satisfactoriamente al menos una notificación';
COMMENT ON COLUMN public.policy_installments.last_notification_at IS 'Fecha y hora del último intento de notificación';
COMMENT ON COLUMN public.policy_installments.whatsapp_status IS 'Estado actual del flujo de notificación por WhatsApp';
