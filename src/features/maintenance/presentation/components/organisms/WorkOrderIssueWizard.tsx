import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/core/presentation/components/ui/form'

import { Textarea } from '@/src/core/presentation/components/ui/textarea'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { createWorkOrderIssueSchema, type CreateWorkOrderIssueInput } from '../../../domain/schemas/create-work-order-issue.schema'
import { useVehicleSystems, useVehicleComponents, useCreateWorkOrderIssue } from '../../hooks/use-maintenance'

interface WorkOrderIssueWizardProps {
  workOrderId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function WorkOrderIssueWizard({ workOrderId, onSuccess, onCancel }: WorkOrderIssueWizardProps) {
  const { data: systems = [], isLoading: isLoadingSystems } = useVehicleSystems()
  const [selectedSystemId, setSelectedSystemId] = React.useState<string | null>(null)
  
  const { data: components = [], isLoading: isLoadingComponents } = useVehicleComponents(selectedSystemId)
  const createIssueMutation = useCreateWorkOrderIssue()

  const form = useForm<CreateWorkOrderIssueInput>({
    resolver: zodResolver(createWorkOrderIssueSchema),
    defaultValues: {
      workOrderId,
      vehicleComponentId: '',
      reportedIssue: '',
      mechanicNotes: '',
    },
  })

  const onSubmit = async (data: CreateWorkOrderIssueInput) => {
    try {
      await createIssueMutation.mutateAsync(data)
      toast.success('Falla registrada correctamente en el historial predictivo')
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Ocurrió un error al registrar la falla')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Registrar Falla (Mantenimiento Predictivo)
        </CardTitle>
        <CardDescription>
          Selecciona el componente exacto que falló para alimentar el modelo predictivo de mantenimientos futuros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Sistema del Vehículo</FormLabel>
                <select
                  disabled={isLoadingSystems}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedSystemId || ''}
                  onChange={(e) => {
                    setSelectedSystemId(e.target.value)
                    form.setValue('vehicleComponentId', '')
                  }}
                >
                  <option value="" disabled>Seleccione un sistema...</option>
                  {systems.map((sys: any) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                control={form.control}
                name="vehicleComponentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Componente Específico</FormLabel>
                    <select
                      disabled={!selectedSystemId || isLoadingComponents}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="" disabled>
                        {!selectedSystemId ? "Primero seleccione un sistema" : "Seleccione el componente..."}
                      </option>
                      {components.map((comp: any) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reportedIssue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Falla Reportada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej. Fuga de aire al pisar el freno, ruido metálico..." 
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mechanicNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones del mecánico sobre el desgaste o causa raíz..." 
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={createIssueMutation.isPending}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={createIssueMutation.isPending}>
                {createIssueMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Falla
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
