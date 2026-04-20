import { Either, Failure } from "@/src/core/domain/either";
import { ITruckRepository } from "../../domain/repositories/ITruckRepository";
import { TruckEntity } from "../../domain/entities";
import { createClient } from "@/src/core/lib/supabase/server";
import { TruckMapper } from "../mappers/TruckMapper";

export class SupabaseTruckRepository implements ITruckRepository {
    async findAll(): Promise<Either<Failure, TruckEntity[]>> {
        try {
            const supabase = await createClient();
            const {data, error} = await supabase.from('trucks').select('*').order('created_at', { ascending: false });

            if (error) {
                return {
                    ok: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: error.message
                    }
                }
            }

            return {
                ok: true,
                data: data.map(TruckMapper.toDomain),
            }
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Error desconocido'
                }
            }
        }
    }

    async findById(id: string): Promise<Either<Failure, TruckEntity>> {
        try {
            const supabase = await createClient();
            const {data, error} = await supabase.from('trucks').select('*').eq('id', id).single();

            if (error) {
                return {
                    ok: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: error.message
                    }
                }
            }

            return {
                ok: true,
                data: TruckMapper.toDomain(data),
            }
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Error desconocido'
                }
            }
        }
    }

    async create(data: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>> {
        try {
            const supabase = await createClient();
            const {data: created, error} = await supabase.from('trucks').insert([TruckMapper.toPersistCreate(data)]).select('*').single();

            if (error) {
                return {
                    ok: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: error.message
                    }
                }
            }

            return {
                ok: true,
                data: TruckMapper.toDomain(data),
            }
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Error desconocido'
                }
            }
        }
    }


    async update(data: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>> {
        try {
            const supabase = await createClient();
            const {data: updated, error} = await supabase.from('trucks').update([TruckMapper.toPersistUpdate(data)]).eq('id', data.id).select('*').single();

            if (error) {
                return {
                    ok: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: error.message
                    }
                }
            }

            return {
                ok: true,
                data: TruckMapper.toDomain(updated),
            }
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Error desconocido'
                }
            }
        }
    }
    async delete(id: string): Promise<Either<Failure, void>> {
        try {
            const supabase = await createClient();
            const {error} = await supabase.from('trucks').delete().eq('id', id);

            if (error) {
                return {
                    ok: false,
                    error: {
                        code: 'FETCH_ERROR',
                        message: error.message
                    }
                }
            }

            return {
                ok: true,
                data: undefined,
            }
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: 'FETCH_ERROR',
                    message: error instanceof Error ? error.message : 'Error desconocido'
                }
            }
        }
    }
}