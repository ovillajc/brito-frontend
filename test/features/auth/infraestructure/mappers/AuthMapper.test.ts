import { describe, it, expect } from 'vitest'
import { AuthMapper } from '@/src/features/auth/infraestructure/mappers/AuthMapper'
import type { User } from '@supabase/supabase-js'

describe('AuthMapper', () => {
  it('should map a Supabase User to a UserEntity', () => {
    const mockSupabaseUser = {
      id: '123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.png'
      }
    } as unknown as User

    const result = AuthMapper.toDomain(mockSupabaseUser)

    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
      createdAt: expect.any(Date),
      lastSignInAt: undefined
    })
  })

  it('should handle missing metadata gracefully', () => {
    const mockSupabaseUser = {
      id: '123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      user_metadata: {}
    } as unknown as User

    const result = AuthMapper.toDomain(mockSupabaseUser)

    expect(result.name).toBeUndefined()
    expect(result.avatarUrl).toBeUndefined()
  })
})
