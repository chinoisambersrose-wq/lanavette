import { useState, type FormEvent } from 'react';
import {
  useAvailability,
  useUpdateAvailability,
} from '../../features/instructor/useAvailability.js';

export default function AvailabilityPage(): JSX.Element {
  const { data: disponibilites, isLoading } = useAvailability();
  const updateAvailability = useUpdateAvailability();

  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  async function handleAdd(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!debut || !fin || !disponibilites) return;

    await updateAvailability.mutateAsync([
      ...disponibilites,
      { debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString() },
    ]);
    setDebut('');
    setFin('');
  }

  async function handleRemove(index: number): Promise<void> {
    if (!disponibilites) return;
    await updateAvailability.mutateAsync(disponibilites.filter((_, i) => i !== index));
  }

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-800">Mes disponibilites</h1>

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-2 rounded-lg border bg-white p-4"
      >
        <label className="text-sm">
          Debut
          <input
            type="date"
            required
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            className="mt-1 block rounded border px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Fin
          <input
            type="date"
            required
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className="mt-1 block rounded border px-2 py-1"
          />
        </label>
        <button type="submit" className="rounded bg-slate-800 px-4 py-1.5 text-sm text-white">
          Ajouter
        </button>
      </form>

      {disponibilites && disponibilites.length > 0 ? (
        <ul className="space-y-2">
          {disponibilites.map((periode, index) => (
            <li
              key={`${periode.debut}-${periode.fin}`}
              className="flex items-center justify-between rounded border bg-white p-3 text-sm"
            >
              <span>
                Du {new Date(periode.debut).toLocaleDateString('fr-FR')} au{' '}
                {new Date(periode.fin).toLocaleDateString('fr-FR')}
              </span>
              <button onClick={() => handleRemove(index)} className="text-red-600 hover:underline">
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">Aucune periode declaree.</p>
      )}
    </div>
  );
}
