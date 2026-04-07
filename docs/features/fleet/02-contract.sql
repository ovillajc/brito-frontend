-- Contract: Módulo de Flotilla

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Tractocamiones
CREATE TABLE IF NOT EXISTS fleet_tractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    plates TEXT UNIQUE NOT NULL,
    vin TEXT UNIQUE NOT NULL,
    insurance_policy TEXT,
    insurance_expiration DATE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Remolques (Trailers)
CREATE TABLE IF NOT EXISTS fleet_trailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trailer_type TEXT NOT NULL, -- 'dry_van', 'reefer', 'flatbed', etc.
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    plates TEXT UNIQUE NOT NULL,
    economic_number TEXT UNIQUE NOT NULL,
    insurance_policy TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Operadores
CREATE TABLE IF NOT EXISTS fleet_operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_type TEXT, -- 'A', 'B', 'C', 'BE', etc.
    license_expiration DATE,
    rfc TEXT UNIQUE,
    nss TEXT UNIQUE,
    curp TEXT UNIQUE,
    address TEXT,
    phone TEXT,
    blood_type TEXT,
    fastrack_id TEXT,
    operator_status TEXT DEFAULT 'active' CHECK (operator_status IN ('active', 'inactive', 'on_trip', 'on_leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Documentos (Polimórfica para Tractos, Trailers y Operadores)
CREATE TABLE IF NOT EXISTS fleet_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL, -- Referencia a tractor_id, trailer_id o operator_id
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tractor', 'trailer', 'operator')),
    document_type TEXT NOT NULL, -- 'invoice', 'insurance', 'license', 'id', etc.
    file_path TEXT NOT NULL, -- Ruta en Supabase Storage
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Armado de Unidades (Asignación actual)
CREATE TABLE IF NOT EXISTS fleet_unit_assemblies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tractor_id UUID REFERENCES fleet_tractors(id),
    trailer_id UUID REFERENCES fleet_trailers(id),
    operator_id UUID REFERENCES fleet_operators(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tractor_id, trailer_id, operator_id, is_active)
);

-- RLS (Row Level Security) - Ejemplo básico (debe ajustarse según roles brito)
ALTER TABLE fleet_tractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_unit_assemblies ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (para usuarios autenticados)
CREATE POLICY "Enable read access for authenticated users" ON fleet_tractors FOR SELECT USING (auth.role() = 'authenticated');
-- Repetir para las demás tablas...

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fleet_tractors_updated_at BEFORE UPDATE ON fleet_tractors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fleet_trailers_updated_at BEFORE UPDATE ON fleet_trailers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fleet_operators_updated_at BEFORE UPDATE ON fleet_operators FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
