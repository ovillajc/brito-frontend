import { ClientEntity } from '../entities'

export interface IClientRepository {
  findAll(): Promise<ClientEntity[]>
  upsert(client: Partial<ClientEntity>): Promise<string>
  delete(id: string): Promise<void>
}
