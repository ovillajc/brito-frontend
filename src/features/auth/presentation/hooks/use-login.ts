import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store'
import { loginFormSchema, type LoginFormInput } from '../../domain/schemas/login.schema'
import { LoginWithEmailUseCase } from '../../aplication/use-cases/LoginWithEmailUseCase'
import { SupabaseAuthRepository } from '../../infraestructure/repositories/SupabaseAuthRepository'
import { toast } from 'sonner'

/**
 * @fileoverview Hook para la lógica del inicio de sesión.
 * Utiliza react-hook-form con validación de Zod y orquesta el caso de uso de login.
 */

export function useLogin(): {
  form: UseFormReturn<LoginFormInput, any, LoginFormInput>
  handleLogin: SubmitHandler<LoginFormInput>
  onProviderLogin: (provider: 'google' | 'apple') => Promise<void>
  isLoading: boolean
} {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const router = useRouter()

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onTouched'
  })

  /**
   * Manejador del envío del formulario.
   */
  const handleLogin: SubmitHandler<LoginFormInput> = async (values) => {
    setLoading(true)
    const repository = new SupabaseAuthRepository()
    
    try {
      const result = await LoginWithEmailUseCase(repository, values)

      if (result.ok) {
        setUser(result.data)
        router.push('/dashboard')
        toast.success(`Bienvenido de nuevo, ${result.data.name}`)
      } else {
        toast.error(result.error.message)
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado al intentar iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Maneja el login con proveedores sociales.
   */
  const onProviderLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    const authRepository = new SupabaseAuthRepository()
    const result = await authRepository.loginWithProvider(provider)

    if (!result.ok) {
      setLoading(false)
      toast.error(result.error.message)
    }
  }

  return {
    form: form,
    handleLogin,
    onProviderLogin,
    isLoading: form.formState.isSubmitting,
  }
}
