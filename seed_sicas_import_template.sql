-- MIGRACIÓN DE DATOS: Aseguradoras Legacy SICAS
-- 1. Crear tabla temporal para carga cruda
CREATE TEMP TABLE IF NOT EXISTS temp_import_insurers (
    nombre_aseguradora TEXT,
    clave_agente TEXT,
    tipo_clave TEXT, -- 'Directa', 'Broker'
    rfc TEXT,
    alias TEXT
);

-- 2. NOTA PARA EL USUARIO:
-- Como Supabase web no permite subir CSVs directo a SQL arbitrario fácilmente,
-- la estrategia será transformar tu CSV en INSERTs masivos.

-- A continuación el script que convierte tus datos (Basado en el CSV leído):
-- (Este bloque se llenará dinámicamente con los datos que lea del CSV)

/* EJEMPLO DE ESTRUCTURA:
INSERT INTO temp_import_insurers VALUES 
('GNP', 'A123', 'Directa', 'GNP...', 'GNP'),
('AXA', 'B456', 'Broker', 'AXA...', 'AXA');
*/

-- 3. MIGRAR A TABLAS REALES

-- 3.1 Insertar Aseguradoras (Si no existen por nombre/alias)
INSERT INTO public.insurers (name, alias, rfc)
SELECT DISTINCT 
    nombre_aseguradora, 
    COALESCE(alias, nombre_aseguradora), 
    rfc
FROM temp_import_insurers
ON CONFLICT DO NOTHING; -- Evitar duplicados si ya corrimos el seed inicial

-- 3.2 Insertar Claves de Agente
INSERT INTO public.agent_codes (user_id, insurer_id, code, type, description)
SELECT 
    auth.uid(), -- Asignar al usuario actual (o especificar UUID si es admin)
    i.id,
    t.clave_agente,
    CASE WHEN LOWER(t.tipo_clave) LIKE '%broker%' THEN 'broker' ELSE 'direct' END,
    'Importado SICAS'
FROM temp_import_insurers t
JOIN public.insurers i ON i.name = t.nombre_aseguradora OR i.alias = t.nombre_aseguradora
ON CONFLICT DO NOTHING;

-- 4. Limpieza
DROP TABLE temp_import_insurers;
