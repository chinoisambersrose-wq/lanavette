import { Link } from 'react-router-dom';
import { useInstructorSessions } from '../../features/instructor/useInstructorSessions.js';
import { populatedLabel } from '../../types/admin.js';

export default function PlanningPage(): JSX.Element {
  const { data: sessions, isLoading } = useInstructorSessions();

  if (isLoading) return <p>Chargement...</p>;

  if (!sessions || sessions.length === 0) {
    return <p className="text-slate-500">Aucune session pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold text-slate-800">Mon planning</h1>

      {sessions.map((session) => {
        const premierJour = session.dates[0]?.jour;
        return (
          <Link
            key={session._id}
            to={`/moniteur/sessions/${session._id}`}
            className="block rounded-lg border bg-white p-4 shadow-sm"
          >
            <p className="font-medium text-slate-800">{populatedLabel(session.formulaId)}</p>
            <p className="text-sm text-slate-500">
              {premierJour ? new Date(premierJour).toLocaleDateString('fr-FR') : '-'} ·{' '}
              {populatedLabel(session.meetingPointId)}
            </p>
            <p className="text-xs text-slate-400">
              {session.placesTotal - session.placesRestantes} / {session.placesTotal} eleve(s)
            </p>
          </Link>
        );
      })}
    </div>
  );
}
