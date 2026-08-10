import type { 
  WorkshopStayEntity, 
  WorkshopWorkOrderEntity, 
  WorkOrderPartEntity 
} from '../entities/entities'

import type {
  CreateWorkshopStayInput,
  CreateWorkOrderInput,
  CreateWorkOrderPartInput
} from '../schemas/schemas'

/**
 * @fileoverview Interfaces de los repositorios para la gestión de Mantenimiento.
 */

export interface IWorkshopStayRepository {
  /**
   * Obtiene una bitácora de estancia por su ID.
   */
  findById(id: string): Promise<WorkshopStayEntity | null>

  /**
   * Obtiene todas las estancias.
   */
  findAll(): Promise<WorkshopStayEntity[]>

  /**
   * Crea una nueva estancia en el taller.
   */
  create(input: CreateWorkshopStayInput): Promise<WorkshopStayEntity>

  /**
   * Actualiza los datos de una estancia existente (ej. marcar salida).
   */
  update(id: string, data: Partial<WorkshopStayEntity>): Promise<WorkshopStayEntity>
}

export interface IWorkshopWorkOrderRepository {
  /**
   * Obtiene una orden de trabajo por su ID.
   */
  findById(id: string): Promise<WorkshopWorkOrderEntity | null>

  /**
   * Obtiene las órdenes asociadas a una estancia específica.
   */
  findByStayId(stayId: string): Promise<WorkshopWorkOrderEntity[]>

  /**
   * Crea una nueva orden de trabajo.
   */
  create(input: CreateWorkOrderInput): Promise<WorkshopWorkOrderEntity>

  /**
   * Actualiza el estado o datos de una orden de trabajo (ej. completada).
   */
  update(id: string, data: Partial<WorkshopWorkOrderEntity>): Promise<WorkshopWorkOrderEntity>
}

export interface IWorkOrderPartRepository {
  /**
   * Obtiene una pieza o material por su ID.
   */
  findById(id: string): Promise<WorkOrderPartEntity | null>

  /**
   * Obtiene las piezas registradas bajo una orden de trabajo específica.
   */
  findByWorkOrderId(workOrderId: string): Promise<WorkOrderPartEntity[]>

  /**
   * Agrega una nueva pieza o servicio a una orden de trabajo.
   */
  create(input: CreateWorkOrderPartInput): Promise<WorkOrderPartEntity>

  /**
   * Elimina un registro de pieza de la orden.
   */
  delete(id: string): Promise<void>
}
