-- MIGRACIÓN SICAS: Carga de Aseguradoras
-- Basado en el archivo: aseguradoras.csv
-- Lógica: Inserta solo si NO existe una aseguradora con el mismo RFC.

INSERT INTO public.insurers (name, alias, rfc, active)
SELECT * FROM (VALUES
    ('Allianz México, S.A.', 'ALLIANZ', 'AMS950419EG4', true),
    ('AXA SEGUROS, S.A. DE C.V.', 'AXA', 'ASE931116231', true),
    ('Chubb Seguros México, S.A.', 'CHUBB-MX', 'ABA920310QW0', true),
    ('GENERAL DE SEGUROS, S.A .DE C.V.', 'GENERAL', 'GSE720216JJS', true),
    ('GRUPO NACIONAL PROVINCIAL, S.A.B.', 'GNP', 'GNP9211244P0', true),
    ('HDI SEGUROS, S.A DE .C.V.', 'HDI', 'HSE701218532', true),
    ('MAPFRE MEXICO, S.A. DE C.V.', 'MAPFRE', 'MTE440316E54', true),
    ('MetLife Mexico S.A.', 'METLIFE', 'MME920427EM3', true),
    ('Plan Seguro S.A. de C.V.', 'PLAN SEGURO', 'PSS970203FI6', true),
    ('QUALITAS COMPAÑIA DE SEGUROS, S.A. DE C.V.', 'QUALITAS', 'QCS931209G49', true),
    ('SEGUROS BANORTE GENERALLI, S.A. DE C.V.', 'BANORTE', 'SBG971124PL2', true),
    ('Seguros El Potosí, S.A.', 'ELPOTOSI', 'SPO830427DQ1', true),
    ('SEGUROS MONTERREY NEW YORK LIFE, S.A. DE C.V.', 'Seguros Monterrey', 'SMN930802FN9', true),
    ('Seguros Ve por Más, S.A.', 'BXMAS', 'SMS401001573', true),
    ('Servicios Integrales de Salud Nova, S.A. de C.V.', 'SISNOVA', 'SIS0309056K1', true),
    ('SURA COMPAÑIA DE SEGUROS, S.A.', 'SURA', 'R&S811221KR6', true),
    ('ZURICH COMPAÑIA DE SEGUROS, S.A.', 'ZURICH', 'ZSE950306M48', true)
) AS t(name, alias, rfc, active)
WHERE NOT EXISTS (
    SELECT 1 FROM public.insurers i WHERE i.rfc = t.rfc
);
