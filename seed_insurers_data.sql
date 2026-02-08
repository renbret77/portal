-- SEED DATA: Aseguradoras y Ramos
-- Ejecutar DESPUÉS de migration_v5

-- 1. Insertar Ramos (Insurance Lines)
INSERT INTO public.insurance_lines (name, category) VALUES
('Autos Residentes', 'Autos'),
('Autos Turistas', 'Autos'),
('Camiones y Equipo Pesado', 'Autos'),
('Gastos Médicos Mayores Individual', 'GMM'),
('Gastos Médicos Mayores Colectivo', 'GMM'),
('Vida Individual', 'Vida'),
('Vida Grupo', 'Vida'),
('Accidentes Personales', 'Vida'),
('Hogar / Casa Habitación', 'Daños'),
('Empresarial / Pyme', 'Daños'),
('Responsabilidad Civil', 'Daños'),
('Transporte de Carga', 'Daños')
ON CONFLICT DO NOTHING;

-- 2. Insertar Aseguradoras (Top Market Share México)
INSERT INTO public.insurers (name, alias, rfc, website) VALUES
('Grupo Nacional Provincial, S.A.B.', 'GNP Seguros', 'GNP9211244P0', 'https://www.gnp.com.mx'),
('AXA Seguros, S.A. de C.V.', 'AXA', 'AXA000101XYZ', 'https://www.axa.mx'),
('Qualitas Compañía de Seguros', 'Quálitas', 'QCS931209G49', 'https://www.qualitas.com.mx'),
('Chubb Seguros México, S.A.', 'Chubb', 'ABA920310QW0', 'https://www.chubb.com/mx'),
('Seguros Monterrey New York Life', 'Monterrey NYL', 'MNY511201XYZ', 'https://mnyl.com.mx'),
('Mapfre México, S.A.', 'Mapfre', 'MAP900101XYZ', 'https://www.mapfre.com.mx'),
('HDI Seguros, S.A. de C.V.', 'HDI', 'HDI000101XYZ', 'https://www.hdi.com.mx'),
('Seguros Banorte, S.A. de C.V.', 'Banorte', 'SB000101XYZ', 'https://www.banorte.com'),
('Seguros Inbursa, S.A.', 'Inbursa', 'SIN000101XYZ', 'https://www.inbursa.com'),
('Allianz México, S.A.', 'Allianz', 'ALZ000101XYZ', 'https://www.allianz.com.mx'),
('Seguros Atlas, S.A.', 'Atlas', 'SAT000101XYZ', 'https://www.segurosatlas.com.mx'),
('AIG Seguros México', 'AIG', 'AIG000101XYZ', 'https://www.aig.com.mx'),
('Ana Compañía de Seguros', 'ANA Seguros', 'ANA000101XYZ', 'https://www.anaseguros.com.mx')
ON CONFLICT DO NOTHING;

-- Nota: Los logos se actualizarán manualmente o vía UI posteriormente.
