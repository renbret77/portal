-- MIGRACIÓN V7: Módulo de Pólizas (Core) - REVISION 1
-- Fecha: 2026-02-06
-- Autor: Antigravity

-- 0. Eliminar tabla anterior si existe (de esquema inicial básico)
-- Esto es necesario porque la tabla original no tenía las columnas necesarias (insurer_id, policy_data, etc)
DROP TABLE IF EXISTS public.policy_documents CASCADE;
DROP TABLE IF EXISTS public.policies CASCADE;

-- 1. Tabla de Pólizas (Rediseñada)
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    insurer_id UUID NOT NULL REFERENCES public.insurers(id),
    agent_code_id UUID REFERENCES public.agent_codes(id),
    policy_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Vigente', -- Vigente, Vencida, Cancelada, Pendiente
    branch_id UUID REFERENCES public.insurance_lines(id), -- Ramo (Autos, GMM, etc)
    sub_branch TEXT,
    
    -- Vigencias
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    issue_date DATE,
    renewal_of UUID REFERENCES public.policies(id), -- Referencia a la póliza anterior
    
    -- Económicos
    currency TEXT DEFAULT 'MXN',
    premium_net NUMERIC(15,2),
    tax NUMERIC(15,2),
    premium_total NUMERIC(15,2),
    payment_method TEXT, -- Contado, Mensual, Trimestral, Semestral
    
    -- Atributos dinámicos por ramo (Placas, Serie, Asegurados, etc)
    policy_data JSONB DEFAULT '{}',
    
    -- Metadata adicional
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Pólizas
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage Own Policies" ON public.policies 
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Tabla para documentos adjuntos a la póliza
CREATE TABLE IF NOT EXISTS public.policy_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- Carátula, Recibo, Condiciones, Endoso
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Documentos de Póliza
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage Policy Docs" ON public.policy_documents 
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_policies_client ON public.policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_number ON public.policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_dates ON public.policies(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_policies_insurer ON public.policies(insurer_id);
