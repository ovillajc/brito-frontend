-- ==============================================================================
-- RPC: get_trips_for_fuel_load
-- Optimizado para devolver solo lo necesario para el listado de selección de carga de combustible.
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_trips_for_fuel_load(
    p_start_date timestamptz, 
    p_end_date timestamptz
)
RETURNS TABLE (
    id uuid,
    folio text,
    trip_number bigint,
    status text,
    origin text,
    destination text,
    departure_date timestamptz,
    unit_assembly_id uuid,
    unit_economic_number text,
    operator_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.folio,
        t.trip_number,
        t.status::text,
        t.origin,
        t.destination,
        t.departure_date,
        t.unit_assembly_id,
        ua.economic_number AS unit_economic_number,
        e.full_name AS operator_name
    FROM trips t
    LEFT JOIN unit_assemblies ua ON t.unit_assembly_id = ua.id
    LEFT JOIN employees e ON ua.employee_id = e.id
    WHERE t.departure_date >= p_start_date 
      AND t.departure_date <= p_end_date
    ORDER BY t.departure_date DESC;
END;
$$;
