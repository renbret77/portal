INSERT INTO public.postal_codes_intelligence (zip_code, colony, municipality, state, socioeconomic_level, risk_score)
VALUES ('11510', 'Polanco V Sección', 'Miguel Hidalgo', 'CDMX', 'A/B', 3)
ON CONFLICT (zip_code) DO NOTHING;
