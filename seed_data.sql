-- SCRIPT DE DATOS DE PRUEBA (SEED)
-- Instrucciones:
-- 1. Cambia 'TU_EMAIL_AQUI' por el email con el que te registraste en Supabase.
-- 2. Ejecuta todo el bloque.

DO $$
DECLARE
    target_email TEXT := 'TU_EMAIL_AQUI'; -- <--- ¡PON TU EMAIL AQUÍ!
    v_user_id UUID;
    v_client_id_1 UUID;
    v_client_id_2 UUID;
    v_client_id_3 UUID;
BEGIN
    -- 1. Obtener el ID del usuario basado en el email
    SELECT id INTO v_user_id FROM auth.users WHERE email = target_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', target_email;
    END IF;

    -- 2. Asegurarse de que exista el perfil
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (v_user_id, 'Admin Ren', 'agent')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insertar Clientes
    INSERT INTO public.clients (user_id, first_name, last_name, email, phone, status)
    VALUES 
        (v_user_id, 'Carlos', 'Slim', 'carlos@telmex.com', '555-111-2222', 'active') RETURNING id INTO v_client_id_1;

    INSERT INTO public.clients (user_id, first_name, last_name, email, phone, status)
    VALUES 
        (v_user_id, 'Elon', 'Musk', 'elon@tesla.com', '555-333-4444', 'lead') RETURNING id INTO v_client_id_2;

    INSERT INTO public.clients (user_id, first_name, last_name, email, phone, status)
    VALUES 
        (v_user_id, 'Dua', 'Lipa', 'dua@music.com', '555-999-8888', 'active') RETURNING id INTO v_client_id_3;

    INSERT INTO public.clients (user_id, first_name, last_name, email, phone, status)
    VALUES 
        (v_user_id, 'Checo', 'Pérez', 'checo@f1.com', '555-777-6666', 'active');

    -- 4. Insertar Pólizas
    -- Pólizas para Carlos
    INSERT INTO public.policies (client_id, policy_number, type, carrier, start_date, end_date, premium_amount, status)
    VALUES 
        (v_client_id_1, 'GNP-888444', 'GMM', 'GNP', '2025-01-01', '2026-01-01', 125000.00, 'active'),
        (v_client_id_1, 'AXA-999111', 'Auto', 'AXA', '2025-02-15', '2026-02-15', 25000.50, 'active');

    -- Pólizas para Elon
    INSERT INTO public.policies (client_id, policy_number, type, carrier, start_date, end_date, premium_amount, status)
    VALUES 
        (v_client_id_2, 'QUA-112233', 'Auto', 'Qualitas', '2025-03-01', '2026-03-01', 18000.00, 'pending_renewal');

    -- Pólizas para Dua
    INSERT INTO public.policies (client_id, policy_number, type, carrier, start_date, end_date, premium_amount, status)
    VALUES 
        (v_client_id_3, 'MTL-555666', 'Vida', 'MetLife', '2024-06-01', '2027-06-01', 45000.00, 'active'),
        (v_client_id_3, 'MAP-777888', 'Hogar', 'Mapfre', '2025-01-10', '2026-01-10', 8500.00, 'active');

    RAISE NOTICE '¡Datos de prueba insertados para el usuario %!', target_email;
END $$;
