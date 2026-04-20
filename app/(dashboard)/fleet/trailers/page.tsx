import TrailersPage from '@/src/features/fleet/presentation/components/pages/TrailersPage';

export const metadata = {
  title: 'Catálogo de Remolques | Sistema de Flota',
  description: 'Gestión de remolques y equipos de arrastre',
};

export default function TrailersRoutePage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-6">Administración de Remolques</h1>
      <TrailersPage />
    </div>
  );
}
