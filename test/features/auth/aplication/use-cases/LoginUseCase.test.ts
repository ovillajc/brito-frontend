import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginWithEmailUseCase } from '@/src/features/auth/aplication/use-cases/LoginWithEmailUseCase'
import { IAuthRepository } from '@/src/features/auth/domain/repositories/auth.repository'

describe('LoginWithEmailUseCase', () => {
  let mockAuthRepository: IAuthRepository

  beforeEach(() => {
    mockAuthRepository = {
      loginWithEmail: vi.fn(),
      loginWithProvider: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    }
  })

  it('should return successfully when repository login succeeds', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@test.com', 
      name: 'Test User', 
      createdAt: new Date() 
    }
    vi.mocked(mockAuthRepository.loginWithEmail).mockResolvedValue({
      ok: true,
      data: mockUser,
    })

    const result = await LoginWithEmailUseCase(mockAuthRepository, { 
      email: 'test@test.com', 
      password: 'password123',
      rememberMe: false,
      acceptTerms: true
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(mockUser)
    }
  })

  it('should return failure when repository login fails', async () => {
    const mockFailure = { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    vi.mocked(mockAuthRepository.loginWithEmail).mockResolvedValue({
      ok: false,
      error: mockFailure,
    })

    const result = await LoginWithEmailUseCase(mockAuthRepository, { 
      email: 'test@test.com', 
      password: 'wrongpassword',
      rememberMe: false,
      acceptTerms: true
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual(mockFailure)
    }
  })

  it('should return an UNEXPECTED_ERROR when repository throws', async () => {
    vi.mocked(mockAuthRepository.loginWithEmail).mockRejectedValue(new Error('Network error'))

    const result = await LoginWithEmailUseCase(mockAuthRepository, { 
      email: 'test@test.com', 
      password: 'password123',
      rememberMe: false,
      acceptTerms: true
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('UNEXPECTED_ERROR')
    }
  })
})
