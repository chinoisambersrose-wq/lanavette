import { LESSON_PRESENCE_STATUSES, type LessonPresenceStatus } from 'shared';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSessionStudents } from '../../features/instructor/useInstructorSessions.js';
import {
  useBookingLessons,
  useCreateLesson,
  useSetAvisFinStage,
} from '../../features/instructor/useStudentFiche.js';
import { populatedLabel } from '../../types/admin.js';

const emptyForm = {
  heures: 2,
  competences: '',
  commentaire: '',
  presence: 'presente' as LessonPresenceStatus,
};

export default function StudentFichePage(): JSX.Element {
  const { sessionId, bookingId } = useParams<{ sessionId: string; bookingId: string }>();
  const { data: students } = useSessionStudents(sessionId);
  const { data: lessons, isLoading: lessonsLoading } = useBookingLessons(bookingId);
  const createLesson = useCreateLesson();
  const setAvis = useSetAvisFinStage();

  const [form, setForm] = useState(emptyForm);

  const student = students?.find((s) => s._id === bookingId);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!bookingId) return;

    await createLesson.mutateAsync({
      bookingId,
      date: new Date().toISOString(),
      heures: form.heures,
      competences: form.competences
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      commentaire: form.commentaire || undefined,
      presence: form.presence,
    });
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/moniteur/sessions/${sessionId}`}
        className="text-sm text-slate-500 hover:underline"
      >
        &larr; Retour aux eleves
      </Link>

      {student && (
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">
            {populatedLabel(student.studentId)}
          </h1>
          <p className="text-sm text-slate-500">
            {typeof student.studentId === 'string' ? '' : student.studentId.email}
          </p>
          <p className="text-sm text-slate-500">
            {typeof student.studentId === 'string' ? '' : student.studentId.telephone}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => bookingId && setAvis.mutate({ bookingId, avis: 'pret' })}
              className="rounded border border-green-600 px-3 py-1.5 text-sm text-green-700"
            >
              Pret pour l&apos;examen
            </button>
            <button
              onClick={() => bookingId && setAvis.mutate({ bookingId, avis: 'pas_pret' })}
              className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-700"
            >
              Pas pret
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Saisie apres lecon</h2>
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4">
          <label className="block text-sm">
            Heures effectuees
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.heures}
              onChange={(e) => setForm({ ...form, heures: Number(e.target.value) })}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            Competences travaillees (separees par des virgules)
            <input
              value={form.competences}
              onChange={(e) => setForm({ ...form, competences: e.target.value })}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            Commentaire
            <textarea
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            Presence
            <select
              value={form.presence}
              onChange={(e) =>
                setForm({ ...form, presence: e.target.value as LessonPresenceStatus })
              }
              className="mt-1 block w-full rounded border px-2 py-1"
            >
              {LESSON_PRESENCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={createLesson.isPending}
            className="w-full rounded bg-slate-800 py-2 text-white disabled:opacity-50"
          >
            Enregistrer la lecon
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">Lecons precedentes</h2>
        {lessonsLoading ? (
          <p>Chargement...</p>
        ) : lessons && lessons.length > 0 ? (
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson._id} className="rounded border bg-white p-3 text-sm">
                <p className="font-medium text-slate-800">
                  {new Date(lesson.date).toLocaleDateString('fr-FR')} — {lesson.heures}h (
                  {lesson.presence})
                </p>
                {lesson.competences.length > 0 && (
                  <p className="text-slate-500">{lesson.competences.join(', ')}</p>
                )}
                {lesson.commentaire && <p className="text-slate-500">{lesson.commentaire}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Aucune lecon enregistree.</p>
        )}
      </section>
    </div>
  );
}
