import { Link, useParams } from 'react-router-dom';
import { useSessionStudents } from '../../features/instructor/useInstructorSessions.js';
import { populatedLabel } from '../../types/admin.js';

const AVIS_LABELS: Record<string, string> = { pret: 'Pret', pas_pret: 'Pas pret' };

export default function SessionStudentsPage(): JSX.Element {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: students, isLoading } = useSessionStudents(sessionId);

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div className="space-y-3">
      <Link to="/moniteur" className="text-sm text-slate-500 hover:underline">
        &larr; Retour au planning
      </Link>
      <h1 className="text-lg font-semibold text-slate-800">Eleves de la session</h1>

      {!students || students.length === 0 ? (
        <p className="text-slate-500">Aucun eleve inscrit.</p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student._id}
              to={`/moniteur/sessions/${sessionId}/eleves/${student._id}`}
              className="block rounded-lg border bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-slate-800">{populatedLabel(student.studentId)}</p>
              <p className="text-sm text-slate-500">{student.statut}</p>
              {student.avisFinStage && (
                <p className="text-xs text-slate-400">
                  Avis : {AVIS_LABELS[student.avisFinStage] ?? student.avisFinStage}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
