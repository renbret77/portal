-- SEED DATOS: Ramos y Sub-ramos (Inspirado en SICAS)
-- Borramos los anteriores para cargar la estructura limpia y mejorada
TRUNCATE public.insurance_lines CASCADE;

INSERT INTO public.insurance_lines (category, name, code, requires_renewal, iva_applies) VALUES
-- ACCIDENTES Y ENFERMEDADES (GMM)
('GMM', 'Gastos Médicos Familiar', 'GMM-FAM', true, true),
('GMM', 'Accidentes Personales Individual', 'ACC-IND', true, true),
('GMM', 'Viaje / Asistencia en Viaje', 'VIAJE', true, true),

-- VEHÍCULOS (AUTOS)
('Autos', 'Automóviles Individuales', 'AUTO-IND', true, true),
('Autos', 'Automóviles Turistas', 'AUTO-TUR', true, true),
('Autos', 'Camiones y Equipo Pesado', 'AUTO-COM', true, true),
('Autos', 'Motocicletas', 'MOTO', true, true),
('Autos', 'Transporte Público', 'AUTO-PUB', true, true),

-- VIDA
('Vida', 'Vida Individual', 'VIDA-IND', true, false), -- SICAS dice IVA No
('Vida', 'Educacional', 'VIDA-EDU', true, false), -- SICAS dice IVA No
('Vida', 'Gastos Funerarios', 'FUNERAL', true, false), -- SICAS dice IVA No
('Vida', 'Pensión / Retiro', 'RETIRO', true, false), -- SICAS dice IVA No

-- DAÑOS
('Daños', 'Hogar / Casa Habitación', 'HOGAR', true, true),
('Daños', 'Empresarial / PyME', 'PYME', true, true),
('Daños', 'Responsabilidad Civil', 'RC', true, true),
('Daños', 'Robo y Asalto', 'ROBO', true, true),
('Daños', 'Transporte de Carga', 'TRANS-CARGA', true, true),
('Daños', 'Dinero y Valores', 'DINERO', true, true),

-- FIANZAS
('Fianzas', 'Fianza Administrativa', 'FZ-ADM', false, true), -- SICAS dice Renovación No
('Fianzas', 'Fianza Jurídica', 'FZ-JUD', false, true) -- SICAS dice Renovación No
ON CONFLICT DO NOTHING;
