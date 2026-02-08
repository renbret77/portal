-- Esquema Inicial para Portal SaaS de Seguros RB

-- 1. PROFILES (Perfiles de Usuario)
-- Extiende la tabla auth.users de Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar seguridad (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CLIENTS (Clientes)
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL, -- El agente dueño del cliente
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'lead', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Política: Los agentes solo ven sus propios clientes
CREATE POLICY "Agents can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);

-- 3. POLICIES (Pólizas)
CREATE TABLE public.policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  policy_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Auto', 'GMM', 'Vida', 'Daños', 'Hogar')), 
  carrier TEXT NOT NULL, -- Aseguradora (GNP, AXA, Qualitas, etc.)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium_amount DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_renewal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Política: Ver pólizas a través de los clientes del agente
CREATE POLICY "Agents can view policies of their clients" ON public.policies FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.clients WHERE public.clients.id = public.policies.client_id AND public.clients.user_id = auth.uid()));

-- Insertar datos de prueba (Se ejecutaría manualmente después)
-- INSERT INTO public.clients (...) VALUES ...
