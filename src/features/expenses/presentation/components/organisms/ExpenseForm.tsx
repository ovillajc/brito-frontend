'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { createExpenseSchema } from '../../../domain/schemas/create-expense.schema'
import { EXPENSE_CATEGORY, EXPENSE_SCOPE, type ExpenseScope } from '../../../domain/entities/expense-entity'
import type { CreateExpenseInput } from '../../../domain/schemas/create-expense.schema'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Textarea } from '@/src/core/presentation/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/core/presentation/components/ui/form'

type FormValues = {
  companyId: string
  scope: ExpenseScope
  category: string
  description: string
  amount: string
  occurredAt: string
  vendorName: string
  reference: string
  tripId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  [EXPENSE_CATEGORY.Permits]: 'Permisos',
  [EXPENSE_CATEGORY.Certifications]: 'Certificaciones',
  [EXPENSE_CATEGORY.InventoryPurchase]: 'Compras de inventario',
  [EXPENSE_CATEGORY.SpareParts]: 'Refacciones',
  [EXPENSE_CATEGORY.Tools]: 'Herramientas',
  [EXPENSE_CATEGORY.PPE]: 'Equipo EPP',
  [EXPENSE_CATEGORY.Tolls]: 'Casetas',
  [EXPENSE_CATEGORY.FuelLoad]: 'Carga de combustible',
  [EXPENSE_CATEGORY.BaseTankLoad]: 'Carga tanque base',
  [EXPENSE_CATEGORY.TripIncidents]: 'Incidencias de viaje',
  [EXPENSE_CATEGORY.Maintenance]: 'Mantenimientos',
  [EXPENSE_CATEGORY.Other]: 'Otro',
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function ExpenseForm({
  defaultScope = EXPENSE_SCOPE.General,
  companyId = 'company_brito',
  onSubmitExpense,
  isSubmitting,
}: {
  defaultScope?: ExpenseScope
  companyId?: string
  onSubmitExpense: (input: CreateExpenseInput) => Promise<void>
  isSubmitting: boolean
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      companyId,
      scope: defaultScope,
      category: EXPENSE_CATEGORY.Other,
      description: '',
      amount: '',
      occurredAt: new Date().toISOString().slice(0, 10),
      vendorName: '',
      reference: '',
      tripId: '',
    },
    mode: 'onSubmit',
  })

  const scope = form.watch('scope')

  const handleSubmit = async (values: FormValues) => {
    const parsed = createExpenseSchema.safeParse({
      companyId: values.companyId,
      scope: values.scope,
      category: values.category,
      description: values.description,
      amount: values.amount,
      occurredAt: values.occurredAt,
      vendorName: normalizeNullable(values.vendorName),
      reference: normalizeNullable(values.reference),
      tripId: values.scope === EXPENSE_SCOPE.Trip ? normalizeNullable(values.tripId) : null,
    })

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      if (fieldErrors.amount?.[0]) {
        form.setError('amount', { type: 'manual', message: fieldErrors.amount[0] })
      }
      if (fieldErrors.description?.[0]) {
        form.setError('description', { type: 'manual', message: fieldErrors.description[0] })
      }
      if (fieldErrors.occurredAt?.[0]) {
        form.setError('occurredAt', { type: 'manual', message: fieldErrors.occurredAt[0] })
      }
      if (fieldErrors.tripId?.[0]) {
        form.setError('tripId', { type: 'manual', message: fieldErrors.tripId[0] })
      }
      return
    }

    await onSubmitExpense(parsed.data)
    form.reset({
      companyId,
      scope: values.scope,
      category: EXPENSE_CATEGORY.Other,
      description: '',
      amount: '',
      occurredAt: new Date().toISOString().slice(0, 10),
      vendorName: '',
      reference: '',
      tripId: '',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-outline-variant/30 bg-white dark:bg-zinc-900 px-3 text-sm"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value={EXPENSE_SCOPE.General}>Operativo</option>
                  <option value={EXPENSE_SCOPE.Trip}>Viaje</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-outline-variant/30 bg-white dark:bg-zinc-900 px-3 text-sm"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occurredAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto (MXN)</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {scope === EXPENSE_SCOPE.Trip && (
          <FormField
            control={form.control}
            name="tripId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de viaje</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: trip_1024" value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="vendorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Input placeholder="Opcional" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia</FormLabel>
              <FormControl>
                <Input placeholder="Folio / factura / ticket (opcional)" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Detalle del gasto" value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Registrar gasto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
