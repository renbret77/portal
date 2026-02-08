-- MIGRACIÓN V3: Storage Multimedia y Geo-Inteligencia
-- Ejecutar en SQL Editor de Supabase

-- 1. Habilitar Storage para Documentos de Clientes
-- Intentamos crear el bucket si no existe (la inserción directa suele ser necesaria si no se hace por UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client_docs', 'client_docs', true) -- Public true para facilitar acceso de lectura por ahora (o false y usar signed urls)
ON CONFLICT (id) DO NOTHING;

-- Policies para Storage (Para que usuarios autenticados puedan subir ver)
-- Nota: En producción idealmente restringiríamos por user_id, pero para MVP CRM interno:
-- Permitir lectura pública (o autenticada)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'client_docs' );
-- Permitir subida a usuarios autenticados
CREATE POLICY "Auth Users Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'client_docs' AND auth.role() = 'authenticated' );
-- Permitir actualización/borrado a usuarios autenticados
CREATE POLICY "Auth Users Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'client_docs' AND auth.role() = 'authenticated' );
CREATE POLICY "Auth Users Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'client_docs' AND auth.role() = 'authenticated' );

-- 2. Tabla de Inteligencia Geográfica (CPs)
CREATE TABLE IF NOT EXISTS public.postal_codes_intelligence (
    zip_code text PRIMARY KEY,
    municipality text,
    state text,
    settlement_type text, -- 'Urbano', 'Rural'
    colony text, -- Colonia principal o lista
    socioeconomic_level text, -- 'A/B', 'C+', 'C', 'D'
    risk_score int, -- 1-10 (1 bajo riesgo, 10 alto)
    avg_property_value numeric -- Valor promedio propiedad
);

-- Habilitar RLS en tabla CPs (lectura para todos los autenticados)
ALTER TABLE public.postal_codes_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.postal_codes_intelligence FOR SELECT 
TO authenticated 
USING (true);

-- Insertar Datos Semilla (Ejemplos VIP y Normales)
INSERT INTO public.postal_codes_intelligence (zip_code, colony, municipality, state, socioeconomic_level, risk_score)
VALUES 
('11520', 'Granada (Polanco)', 'Miguel Hidalgo', 'CDMX', 'A/B', 3),
('01210', 'Santa Fe', 'Álvaro Obregón', 'CDMX', 'A/B', 2),
('03100', 'Del Valle', 'Benito Juárez', 'CDMX', 'C+', 4),
('06700', 'Roma Norte', 'Cuauhtémoc', 'CDMX', 'C+', 5),
('53100', 'Ciudad Satélite', 'Naucalpan', 'Edo Mex', 'C+', 4)
ON CONFLICT (zip_code) DO NOTHING;
