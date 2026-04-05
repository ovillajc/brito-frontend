import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/src/features/auth/presentation/store'

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should set user and update isAuthenticated', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test User', createdAt: new Date() }
    
    useAuthStore.getState().setUser(mockUser)
    
    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear user on logout', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test User', createdAt: new Date() }
    useAuthStore.getState().setUser(mockUser)
    
    useAuthStore.getState().logout()
    
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should update isLoading state', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
