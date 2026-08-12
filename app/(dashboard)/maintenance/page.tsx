import { redirect } from 'next/navigation'

export default function MaintenanceRootPage() {
  redirect('/maintenance/dashboard')
}
