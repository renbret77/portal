-- MIGRACIÓN V5: Módulo de Aseguradoras, Ramos y Geografía
-- Fecha: 2026-02-06
-- Autor: Antigravity

-- 1. Catálogo de Aseguradoras
CREATE TABLE IF NOT EXISTS public.insurers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    alias TEXT, -- Nombre corto (e.g., "GNP")
    rfc TEXT,
    logo_url TEXT,
    website TEXT,
    support_phone TEXT, -- Teléfono general de siniestros
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- RLS: Aseguradoras
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read Insurers Public" ON public.insurers FOR SELECT USING (true);
CREATE POLICY "Manage Insurers Auth" ON public.insurers FOR ALL USING (auth.role() = 'authenticated');

-- 2. Claves de Agente (Multi-clave por usuario/tenant)
-- Nota: En este SaaS, asumimos que el usuario es el "dueño" de las claves, 
-- pero si fuera multi-tenant real, deberíamos vincularlo a una `organization_id`.
-- Por ahora vinculamos al `user_id` del agente que registra la clave.
CREATE TABLE IF NOT EXISTS public.agent_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- El usuario dueño de esta clave
    insurer_id UUID REFERENCES public.insurers(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- La clave "A1234"
    type TEXT CHECK (type IN ('direct', 'broker')), -- 'direct' (Directa) o 'broker' (Promotoría)
    broker_name TEXT, -- Solo si es broker (e.g. "Grupo CLK")
    description TEXT, -- "Clave Vida", "Clave Daños", etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Claves de Agente
ALTER TABLE public.agent_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage Own Agent Codes" ON public.agent_codes 
    FOR ALL USING (auth.uid() = user_id);

-- 3. Catálogo de Ramos (Lines of Business)
CREATE TABLE IF NOT EXISTS public.insurance_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- "Vida Individual", "Autos Turistas"
    category TEXT, -- "Vida", "Daños", "Autos", "GMM"
    active BOOLEAN DEFAULT true
);

-- RLS: Ramos (Lectura pública)
ALTER TABLE public.insurance_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read Lines Public" ON public.insurance_lines FOR SELECT USING (true);

-- 4. Configuraciones por Aseguradora y Ramo (Reglas de Negocio)
CREATE TABLE IF NOT EXISTS public.insurer_line_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insurer_id UUID REFERENCES public.insurers(id) ON DELETE CASCADE,
    line_id UUID REFERENCES public.insurance_lines(id) ON DELETE CASCADE,
    
    -- Reglas de Negocio
    fixed_fee NUMERIC(10,2) DEFAULT 0, -- Derecho de Póliza Fijo
    fractional_surcharge_percentage NUMERIC(5,2) DEFAULT 0, -- Recargo por pago fraccionado (%)
    
    notes TEXT, -- Notas libres
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(insurer_id, line_id) -- Solo una configuración por par Aseguradora-Ramo
);

-- RLS: Configs (Lectura pública, Escritura auth)
ALTER TABLE public.insurer_line_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read Configs Public" ON public.insurer_line_configs FOR SELECT USING (true);
CREATE POLICY "Manage Configs Auth" ON public.insurer_line_configs FOR ALL USING (auth.role() = 'authenticated');


-- 5. Catálogo Completo de Códigos Postales (Optimizado)
-- Reemplaza o complementa a la tabla ligera de "intelligence" anterior si se desea
CREATE TABLE IF NOT EXISTS public.postal_codes_catalog (
    zip_code TEXT PRIMARY KEY,
    municipality TEXT,
    state TEXT,
    city TEXT,
    colonies JSONB -- Lista de colonias: ["Polanco", "Granada", ...] (Más eficiente que 1 row por colonia)
);

ALTER TABLE public.postal_codes_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read CP Public" ON public.postal_codes_catalog FOR SELECT USING (true);
