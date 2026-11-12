import { GEARBOXES } from 'shared';
import { useSearchParams } from 'react-router-dom';
import LeadContactForm from '../components/LeadContactForm.js';
import { useCitiesCatalog, useSessionsCatalog } from '../features/catalog/useCatalog.js';
import { populatedLabel } from '../types/admin.js';

export default function SessionsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

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

      {isLoading ? (
        <p>Chargement...</p>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.map((session) => {
            const premierJour = new Date(session.dates[0]?.jour ?? '').toLocaleDateString('fr-FR');
            const dernierJour = new Date(session.dates.at(-1)?.jour ?? '').toLocaleDateString(
              'fr-FR',
            );
            const formuleNom = populatedLabel(session.formulaId);
            const meetingPointNom = populatedLabel(session.meetingPointId);

            return (
              <div key={session._id} className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="font-semibold text-slate-800">{formuleNom}</h2>
                <p className="text-sm text-slate-500">
                  Du {premierJour} au {dernierJour}
                </p>
                <p className="text-sm text-slate-500">{meetingPointNom}</p>
                <p className="text-sm text-slate-500">
                  Moniteur : {populatedLabel(session.instructorId)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {session.placesRestantes} place(s) restante(s)
                </p>
                <LeadContactForm
                  message={`Je suis intéressé(e) par la formule ${formuleNom}, session du ${premierJour} au ${dernierJour} (${meetingPointNom}).`}
                  className="mt-3"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500">Aucune session disponible pour ces criteres.</p>
      )}
    </div>
  );
}
