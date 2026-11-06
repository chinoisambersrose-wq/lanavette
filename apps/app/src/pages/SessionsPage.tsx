import { GEARBOXES } from 'shared';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useCitiesCatalog, useSessionsCatalog } from '../features/catalog/useCatalog.js';
import { useCreateMyBooking } from '../features/student/useMyBookings.js';
import { populatedLabel } from '../types/admin.js';

export default function SessionsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const createBooking = useCreateMyBooking();
  const [error, setError] = useState<string | undefined>(undefined);

  const formula = searchParams.get('formula') ?? '';
  const city = searchParams.get('city') ?? '';
  const boite = searchParams.get('boite') ?? '';

  const { data: cities } = useCitiesCatalog();
  const { data: sessions, isLoading } = useSessionsCatalog({
    formula: formula || undefined,
    city: city || undefined,
    boite: boite || undefined,
  });

  function updateFilter(key: string, value: string): void {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  async function handleReserve(sessionId: string): Promise<void> {
    setError(undefined);

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    try {
      await createBooking.mutateAsync(sessionId);
      navigate('/mon-compte');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation impossible');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Sessions disponibles</h1>

      <div className="mb-6 flex gap-3">
        <select
          value={city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">Toutes les villes</option>
          {cities?.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.nom}
            </option>
          ))}
        </select>
        <select
          value={boite}
          onChange={(e) => updateFilter('boite', e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">Boite manuelle ou auto</option>
          {GEARBOXES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <p>Chargement...</p>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <div key={session._id} className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-800">{populatedLabel(session.formulaId)}</h2>
              <p className="text-sm text-slate-500">
                Du {new Date(session.dates[0]?.jour ?? '').toLocaleDateString('fr-FR')} au{' '}
                {new Date(session.dates.at(-1)?.jour ?? '').toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-slate-500">{populatedLabel(session.meetingPointId)}</p>
              <p className="text-sm text-slate-500">
                Moniteur : {populatedLabel(session.instructorId)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {session.placesRestantes} place(s) restante(s)
              </p>
              <button
                onClick={() => handleReserve(session._id)}
                disabled={createBooking.isPending}
                className="mt-3 rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Reserver
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">Aucune session disponible pour ces criteres.</p>
      )}
    </div>
  );
}
