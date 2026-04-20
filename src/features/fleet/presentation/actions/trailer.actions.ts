'use server'

import { revalidatePath } from "next/cache"
import { SupabaseTrailerRepository } from "../../infrastructure/repositories/SupabaseTrailerRepository"
import { SupabaseTrailerModelRepository } from "../../infrastructure/repositories/SupabaseTrailerModelRepository"
import { CreateTrailerInput, UpdateTrailerInput } from "../../domain/schemas/trailer.schema"
import { 
  GetTrailersUseCase, 
  GetTrailerModelsUseCase, 
  CreateTrailerUseCase, 
  UpdateTrailerUseCase, 
  DeleteTrailerUseCase 
} from "../../application/use-cases/TrailerUseCases"

const trailerRepository = new SupabaseTrailerRepository()
const trailerModelRepository = new SupabaseTrailerModelRepository()

export async function getTrailersAction() {
    return GetTrailersUseCase(trailerRepository)
}

export async function getTrailerModelsAction() {
    return GetTrailerModelsUseCase(trailerModelRepository)
}

export async function createTrailerAction(input: CreateTrailerInput) {
    const result = await CreateTrailerUseCase(trailerRepository, input)
    if (result.ok) revalidatePath('/fleet/trailers')
    return result
}

export async function updateTrailerAction(input: UpdateTrailerInput) {
    const result = await UpdateTrailerUseCase(trailerRepository, input)
    if (result.ok) revalidatePath('/fleet/trailers')
    return result
}

export async function deleteTrailerAction(id: string) {
    const result = await DeleteTrailerUseCase(trailerRepository, id)
    if (result.ok) revalidatePath('/fleet/trailers')
    return result
}
