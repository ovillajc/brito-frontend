-- Seed para la tabla public.clients
INSERT INTO public.clients (
  id, 
  trade_name, 
  company_name, 
  rfc, 
  tax_domicile, 
  tax_regime, 
  updated_at, 
  created_at
)
VALUES
  (
    'b2626043-ee2b-48ff-aeee-78af221f64b8',
    'Walmart',
    'Nueva Walmart de México S. de R.L. de C.V.',
    'NWM9709244W4',
    'Av. Nextengo 78, Col. Santa Cruz Acayucan, Azcapotzalco, CDMX, CP 02770',
    '601 - General de Ley Personas Morales',
    '2026-04-20 16:53:07.78331+00',
    '2026-05-16 13:30:11.557965+00'
  ),
  (
    '2e88460b-483b-46b5-86fe-e2b49685405e',
    'Holcim México',
    'Holcim México, S.A. de C.V.',
    'HME9205126X8',
    'Av. Paseo de la Reforma 215, Piso 15, Lomas de Chapultepec, Miguel Hidalgo, CDMX, CP 11000',
    '601 - General de Ley Personas Morales',
    '2026-05-13 00:05:21.748661+00',
    '2026-05-16 13:30:11.557965+00'
  ),
  (
    '2b004a73-1ac8-4a7b-90e7-83c3b4669e9c',
    'Solinmar',
    'Soluciones Integrales Marítimas S.A. de C.V.',
    'SIM1503248X2',
    'Calle Marina Nacional 120, Col. Centro, CP 96400, Coatzacoalcos, Veracruz',
    '601 - General de Ley Personas Morales',
    '2026-05-13 02:32:42.604451+00',
    '2026-05-16 13:30:11.557965+00'
  ),
  (
    '39fa4688-b8c0-4806-97a8-8ee35b4fd0f9',
    'Altopetrum',
    'Altopetrum Logística y Servicios Petroleros S.A. de C.V.',
    'ALS180712TS5',
    'Av. de los Ríos 301, Tabasco 2000, CP 86035, Villahermosa, Tabasco',
    '601 - General de Ley Personas Morales',
    '2026-05-13 02:32:42.604451+00',
    '2026-05-16 13:30:11.557965+00'
  )
ON CONFLICT (id) DO UPDATE 
SET 
  trade_name = EXCLUDED.trade_name,
  company_name = EXCLUDED.company_name,
  rfc = EXCLUDED.rfc,
  tax_domicile = EXCLUDED.tax_domicile,
  tax_regime = EXCLUDED.tax_regime,
  updated_at = EXCLUDED.updated_at;