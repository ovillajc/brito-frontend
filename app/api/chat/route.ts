import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Clientes ──────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Secret Key is missing in environment variables.');
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Statuses de viaje considerados "activos" ───────────────────────────────
const ACTIVE_TRIP_STATUSES = ['in_progress', 'scheduled', 'in_delivery', 'returning', 'at_client'];

// ─── Resolución de viaje activo ─────────────────────────────────────────────
interface ResolvedTripContext {
  tripId: string | null;
  truckId: string | null;
  trailerId: string | null;
  operatorId: string | null;
  unitAssemblyId: string | null;
  resolvedBy: string | null; // 'truck' | 'trailer' | 'operator' | null
}

async function resolveActiveTrip(
  supabase: SupabaseClient,
  {
    truckEconomicNum,
    trailerEconomicNum,
    operatorName,
  }: {
    truckEconomicNum?: string | null;
    trailerEconomicNum?: string | null;
    operatorName?: string | null;
  }
): Promise<ResolvedTripContext> {
  let truckId: string | null = null;
  let trailerId: string | null = null;
  let operatorId: string | null = null;
  let resolvedBy: string | null = null;

  // 1. Buscar truck por número económico
  if (truckEconomicNum) {
    const { data } = await supabase
      .from('trucks')
      .select('id')
      .ilike('economic_number', truckEconomicNum.trim())
      .limit(1)
      .single();
    if (data) {
      truckId = data.id;
      resolvedBy = 'truck';
    }
  }

  // 2. Buscar trailer por número económico
  if (trailerEconomicNum) {
    const { data } = await supabase
      .from('trailers')
      .select('id')
      .ilike('economic_number', trailerEconomicNum.trim())
      .limit(1)
      .single();
    if (data) {
      trailerId = data.id;
      if (!resolvedBy) resolvedBy = 'trailer';
    }
  }

  // 3. Buscar operador por nombre si no tenemos truck ni trailer
  if (operatorName && !truckId && !trailerId) {
    const { data } = await supabase
      .from('employees')
      .select('id')
      .ilike('full_name', `%${operatorName.trim()}%`)
      .eq('is_operator', true)
      .limit(1)
      .single();
    if (data) {
      operatorId = data.id;
      resolvedBy = 'operator';
    }
  }

  // Sin datos para buscar → no se puede resolver
  if (!truckId && !trailerId && !operatorId) {
    return { tripId: null, truckId: null, trailerId: null, operatorId: null, unitAssemblyId: null, resolvedBy: null };
  }

  // 4. Buscar unit_assembly activo
  let assemblyQuery = supabase
    .from('unit_assemblies')
    .select('id, truck_id, trailer_id, trailer2_id, employee_id')
    .eq('is_active', true);

  if (truckId) {
    assemblyQuery = assemblyQuery.eq('truck_id', truckId);
  } else if (trailerId) {
    // El trailer puede estar como trailer_id o trailer2_id
    assemblyQuery = assemblyQuery.or(`trailer_id.eq.${trailerId},trailer2_id.eq.${trailerId}`);
  } else if (operatorId) {
    assemblyQuery = assemblyQuery.eq('employee_id', operatorId);
  }

  const { data: assembly } = await assemblyQuery.limit(1).single();

  if (!assembly) {
    return { tripId: null, truckId, trailerId, operatorId, unitAssemblyId: null, resolvedBy };
  }

  // Rellenar IDs desde el assembly si no los teníamos
  if (!truckId) truckId = assembly.truck_id ?? null;
  if (!trailerId) trailerId = assembly.trailer_id ?? null;
  if (!operatorId) operatorId = assembly.employee_id ?? null;

  // 5. Buscar viaje activo vinculado al unit_assembly
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('unit_assembly_id', assembly.id)
    .in('status', ACTIVE_TRIP_STATUSES)
    .order('departure_date', { ascending: false })
    .limit(1)
    .single();

  return {
    tripId: trip?.id ?? null,
    truckId,
    trailerId,
    operatorId,
    unitAssemblyId: assembly.id,
    resolvedBy,
  };
}

// ─── Prompts Dinámicas ────────────────────────────────────────────────────────
//
// Un único schema JSON compartido que define el contrato de respuesta.
// Las tres prompts sólo difieren en las instrucciones de modalidad de entrada.

const SCHEMA_BLOCK = `
Defaults: vehicle_type="TRUCK", is_full_tank_fill=false, source_type="EXTERNAL".
Mapeo: "termo"/"caja"=TRAILER | "tracto"/"camión"=TRUCK.
Si faltan litros o precio en alguna carga, pon esa carga con loads:null y pide los datos en reply.
Un mensaje puede contener UNA o MÁS cargas; genera un objeto separado por vehículo.

Responde ÚNICAMENTE con JSON sin markdown:
{
  "reply": "Confirmación o solicitud en español",
  "loads": [
    {
      "vehicle_type": "TRUCK"|"TRAILER",
      "truck_economic_num": string|null,
      "trailer_economic_num": string|null,
      "operator_name": string|null,
      "ticket_folio": string|null,
      "load_date": "ISO8601 (default: ahora)",
      "liters_loaded": number,
      "price_per_liter": number,
      "total_cost": number,
      "is_full_tank_fill": boolean,
      "source_type": "EXTERNAL"|"INTERNAL",
      "odometer_at_load": number|null
    }
  ]
}
Si no hay datos: { "reply": "No entendí. Indica litros y precio.", "loads": null }
`.trim();

/** Prompt para mensajes de TEXTO puro (coloquial o estructurado). */
const PROMPT_TEXT = `
Eres el extractor de cargas de diésel de Transportes Brito.
Analiza el TEXTO recibido y extrae los datos de carga.
Sé flexible con el lenguaje coloquial: "doscientos litros"=200, "a veinte pesos"=20.00.
${SCHEMA_BLOCK}
`.trim();

/** Prompt para mensajes de AUDIO. Paso 1: transcribir. Paso 2: extraer. */
const PROMPT_AUDIO = `
Eres el extractor de cargas de diésel de Transportes Brito.
PASO 1 — Transcribe el audio COMPLETO al español, tal como fue dicho.
PASO 2 — Del texto transcrito, extrae los datos de carga.
${SCHEMA_BLOCK}
`.trim();

/** Prompt para mensajes de IMAGEN (ticket de gasolinera). Paso 1: OCR. Paso 2: extraer. */
const PROMPT_IMAGE = `
Eres el extractor de cargas de diésel de Transportes Brito.
PASO 1 — Aplica OCR preciso a la imagen del ticket de combustible y lee todos los valores.
PASO 2 — De los datos del OCR, extrae los campos de la carga.
${SCHEMA_BLOCK}
`.trim();

/** Selecciona el prompt correcto según el tipo de contenido enviado por el cliente. */
function selectPrompt(itHasAudio: boolean, itHasImage: boolean): string {
  if (itHasAudio) return PROMPT_AUDIO;
  if (itHasImage) return PROMPT_IMAGE;
  return PROMPT_TEXT;
}

// ─── Handler Principal ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Validar API Key de la app móvil
  const mobileApiKey = request.headers.get('x-api-key');
  if (!mobileApiKey || mobileApiKey !== process.env.MOBILE_CHAT_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'No autorizado.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const promptText = (formData.get('text') as string) || '';
    const audioFile = formData.get('audio') as File | null;
    const imageFile = formData.get('image') as File | null;

    // Hints de tipo de contenido enviados por el cliente Flutter
    const itHasAudio = formData.get('it_has_audio') === 'true';
    const itHasImage = formData.get('it_has_image') === 'true';

    // Contexto explícito (opcional, si el guardia ya lo seleccionó en la app)
    const explicitTripId = (formData.get('trip_id') as string) || null;
    const explicitTruckId = (formData.get('truck_id') as string) || null;
    const explicitTrailerId = (formData.get('trailer_id') as string) || null;
    const explicitOperatorId = (formData.get('operator_id') as string) || null;
    const supervisedBy = (formData.get('supervised_by') as string) || null;
    const supervisorName = (formData.get('supervisor_name') as string) || null;

    // 2. Seleccionar el prompt adecuado al tipo de entrada
    const systemPrompt = selectPrompt(itHasAudio, itHasImage);

    // 3. Construir el contenido multimodal para Gemini
    const userParts: any[] = [];

    if (promptText.trim()) {
      userParts.push({ text: promptText });
    }

    if (audioFile) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      userParts.push({
        inlineData: {
          mimeType: audioFile.type || 'audio/mp4',
          data: audioBuffer.toString('base64'),
        },
      });
    }

    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      userParts.push({
        inlineData: {
          mimeType: imageFile.type || 'image/jpeg',
          data: imageBuffer.toString('base64'),
        },
      });
    }

    if (userParts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún contenido.' },
        { status: 400 }
      );
    }

    // 4. Llamar a Gemini con el prompt dinámico
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userParts,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const rawText = response.text?.trim() ?? '';

    // 5. Parsear la respuesta JSON de Gemini
    let parsed: { reply: string; loads: Record<string, any>[] | null } | null = null;
    try {
      const jsonStr = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({
        success: true,
        reply: rawText,
        insertedLoads: [],
        inserted: false,
      });
    }

    const loads = parsed?.loads ?? null;

    if (!loads || loads.length === 0) {
      return NextResponse.json({
        success: true,
        reply: parsed?.reply ?? rawText,
        insertedLoads: [],
        inserted: false,
      });
    }

    // 6. Preparar la inserción de cargas
    const autoInsertFlag = formData.get('auto_insert') as string | null;
    const autoInsert = autoInsertFlag !== 'false'; // Por defecto true

    const supabaseAdmin = getSupabaseAdmin();
    const insertedLoads: Array<{ id: string; vehicle_type: string; liters: number; resolved_trip: boolean }> = [];
    const insertErrors: string[] = [];

    // Guardaremos la data extraída para que el frontend pueda mostrarla (legacy o read-only card)
    let primaryExtractedData: Record<string, any> | null = null;

    for (const load of loads) {
      if (!load.liters_loaded || !load.price_per_liter) {
        insertErrors.push(`Carga sin litros o precio suficiente omitida.`);
        continue;
      }

      // 5a. Resolver el viaje activo
      let resolvedContext: ResolvedTripContext = {
        tripId: explicitTripId,
        truckId: explicitTruckId,
        trailerId: explicitTrailerId,
        operatorId: explicitOperatorId,
        unitAssemblyId: null,
        resolvedBy: explicitTripId ? 'explicit' : null,
      };

      if (!explicitTripId) {
        resolvedContext = await resolveActiveTrip(supabaseAdmin, {
          truckEconomicNum: load.truck_economic_num,
          trailerEconomicNum: load.vehicle_type === 'TRAILER' ? (load.trailer_economic_num ?? load.truck_economic_num) : load.trailer_economic_num,
          operatorName: load.operator_name,
        });
      }

      const payload: Record<string, any> = {
        trip_id: resolvedContext.tripId,
        truck_id: resolvedContext.truckId,
        trailer_id: resolvedContext.trailerId,
        operator_id: resolvedContext.operatorId,
        supervisor_name: supervisorName,
        supervised_by: supervisedBy,
        ticket_folio: load.ticket_folio ?? null,
        load_date: load.load_date ?? new Date().toISOString(),
        liters_loaded: load.liters_loaded,
        price_per_liter: load.price_per_liter,
        total_cost: load.total_cost ?? (load.liters_loaded * load.price_per_liter),
        is_full_tank_fill: load.is_full_tank_fill ?? false,
        vehicle_type: load.vehicle_type ?? 'TRUCK',
        source_type: load.source_type ?? 'EXTERNAL',
        odometer_at_load: load.vehicle_type === 'TRUCK' ? (load.odometer_at_load ?? null) : null,
        created_by: supervisedBy,
      };

      // Guardar datos extraídos con info completa para la tarjeta de la UI
      if (!primaryExtractedData) {
        primaryExtractedData = {
          // Datos del usuario (lo que extrajo Gemini)
          vehicle_type: load.vehicle_type ?? 'TRUCK',
          ticket_folio: load.ticket_folio ?? null,
          load_date: load.load_date ?? new Date().toISOString(),
          liters_loaded: load.liters_loaded,
          price_per_liter: load.price_per_liter,
          total_cost: load.total_cost ?? (load.liters_loaded * load.price_per_liter),
          is_full_tank_fill: load.is_full_tank_fill ?? false,
          source_type: load.source_type ?? 'EXTERNAL',
          odometer_at_load: load.vehicle_type === 'TRUCK' ? (load.odometer_at_load ?? null) : null,
          truck_economic_num: load.truck_economic_num ?? null,
          // Contexto resuelto (viaje/unidad)
          trip_id: resolvedContext.tripId,
          truck_id: resolvedContext.truckId,
          trailer_id: resolvedContext.trailerId,
          operator_id: resolvedContext.operatorId,
          supervised_by: supervisedBy,
          supervisor_name: supervisorName,
        };
      }

      if (autoInsert) {
        const { data: insertedRow, error: dbError } = await supabaseAdmin
          .from('fuel_loads')
          .insert(payload)
          .select('id')
          .single();

        if (dbError) {
          console.error('Supabase insert error:', dbError);
          insertErrors.push(`Error al insertar carga (${load.vehicle_type}): ${dbError.message}`);
        } else if (insertedRow) {
          insertedLoads.push({
            id: insertedRow.id,
            vehicle_type: load.vehicle_type ?? 'TRUCK',
            liters: load.liters_loaded,
            resolved_trip: !!resolvedContext.tripId,
          });
        }
      }
    }

    const allInserted = autoInsert && insertedLoads.length > 0;

    // Construir mensaje de resultado
    let finalReply = parsed?.reply ?? rawText;
    if (allInserted) {
      const tripResolved = insertedLoads.some(l => l.resolved_trip);
      if (!tripResolved) {
        finalReply += '\n\n⚠️ No se encontró un viaje activo para la unidad mencionada. La carga quedó registrada sin viaje y deberá asignarse manualmente.';
      }
    }
    if (insertErrors.length > 0) {
      finalReply += `\n\n❌ Hubo errores en ${insertErrors.length} carga(s): ${insertErrors.join('; ')}`;
    }

    return NextResponse.json({
      success: autoInsert ? allInserted : true,
      reply: finalReply,
      extracted: primaryExtractedData,
      insertedLoads: autoInsert ? insertedLoads : [],
      inserted: allInserted,
      insertErrors: insertErrors.length > 0 ? insertErrors : undefined,
    });

  } catch (error: any) {
    console.error('Error en el proxy de Gemini:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || error?.toString() || 'Error interno procesando la solicitud.',
      },
      { status: 500 }
    );
  }
}