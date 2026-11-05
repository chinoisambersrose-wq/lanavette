import { useState, type FormEvent } from 'react';
import { useAllMeetingPointsAdmin } from '../cities/useCitiesAdmin.js';
import { useExamSlotsAdmin } from '../examSlots/useExamSlotsAdmin.js';
import { useFormulasAdmin } from '../formulas/useFormulasAdmin.js';
import { useUsersAdmin } from '../students/useUsersAdmin.js';
import { populatedLabel } from '../../types/admin.js';
import {
  useCancelSession,
  useCreateSession,
  useDuplicateSession,
  usePublishSession,
  useSessionsAdmin,
} from './useSessionsAdmin.js';

const emptyForm = {
  formulaId: '',
  meetingPointId: '',
  instructorId: '',
  examSlotId: '',
  startDate: '',
  placesTotal: 1,
};

export default function SessionsAdminPage(): JSX.Element {
  const { data: sessions, isLoading } = useSessionsAdmin();
  const { data: formulas } = useFormulasAdmin();
  const { data: meetingPoints } = useAllMeetingPointsAdmin();
  const { data: instructors } = useUsersAdmin('moniteur');
  const { data: examSlots } = useExamSlotsAdmin();

  const createSession = useCreateSession();
  const duplicateSession = useDuplicateSession();
  const publishSession = usePublishSession();
  const cancelSession = useCancelSession();

  const [form, setForm] = useState(emptyForm);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const formula = formulas?.find((f) => f._id === form.formulaId);
    const dureeJours = formula?.dureeJours ?? 1;
    const start = new Date(form.startDate);

    const dates = Array.from({ length: dureeJours }, (_, i) => {
      const jour = new Date(start);
      jour.setDate(jour.getDate() + i);
      return { jour: jour.toISOString(), heureDebut: '09:00', heureFin: '17:00' };
    });

    await createSession.mutateAsync({
      formulaId: form.formulaId,
      meetingPointId: form.meetingPointId,
      instructorId: form.instructorId,
      examSlotId: form.examSlotId || undefined,
      dates,
      placesTotal: form.placesTotal,
    });
    setForm(emptyForm);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Sessions</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-2 gap-3 rounded border bg-white p-4 md:grid-cols-6"
      >
        <select
          required
          value={form.formulaId}
          onChange={(e) => setForm({ ...form, formulaId: e.target.value })}
          className="rounded border px-2 py-1"
        >
          <option value="">Formule...</option>
          {formulas?.map((f) => (
            <option key={f._id} value={f._id}>
              {f.nom}
            </option>
          ))}
        </select>
        <select
          required
          value={form.meetingPointId}
          onChange={(e) => setForm({ ...form, meetingPointId: e.target.value })}
          className="rounded border px-2 py-1"
        >
          <option value="">Point de RDV...</option>
          {meetingPoints?.map((m) => (
            <option key={m._id} value={m._id}>
              {m.nom}
            </option>
          ))}
        </select>
        <select
          required
          value={form.instructorId}
          onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
          className="rounded border px-2 py-1"
        >
          <option value="">Moniteur...</option>
          {instructors?.map((i) => (
            <option key={i._id} value={i._id}>
              {i.prenom} {i.nom}
            </option>
          ))}
        </select>
        <select
          value={form.examSlotId}
          onChange={(e) => setForm({ ...form, examSlotId: e.target.value })}
          className="rounded border px-2 py-1"
        >
          <option value="">Creneau d&apos;examen (optionnel)...</option>
          {examSlots?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.centreExamen} — {new Date(s.date).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </select>
        <input
          type="date"
          required
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <input
          type="number"
          min={1}
          placeholder="Places"
          required
          value={form.placesTotal}
          onChange={(e) => setForm({ ...form, placesTotal: Number(e.target.value) })}
          className="rounded border px-2 py-1"
        />
        <button type="submit" className="col-span-2 rounded bg-slate-800 py-1 text-white">
          Creer la session (brouillon)
        </button>
      </form>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Formule</th>
              <th className="p-2">Point de RDV</th>
              <th className="p-2">Moniteur</th>
              <th className="p-2">Places</th>
              <th className="p-2">Statut</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {sessions?.map((session) => (
              <tr key={session._id} className="border-b">
                <td className="p-2">{populatedLabel(session.formulaId)}</td>
                <td className="p-2">{populatedLabel(session.meetingPointId)}</td>
                <td className="p-2">{populatedLabel(session.instructorId)}</td>
                <td className="p-2">
                  {session.placesRestantes} / {session.placesTotal}
                </td>
                <td className="p-2">{session.statut}</td>
                <td className="flex gap-2 p-2">
                  {session.statut === 'brouillon' && (
                    <button
                      onClick={() => publishSession.mutate(session._id)}
                      className="text-green-700 hover:underline"
                    >
                      Publier
                    </button>
                  )}
                  <button
                    onClick={() => duplicateSession.mutate(session._id)}
                    className="text-slate-700 hover:underline"
                  >
                    Dupliquer
                  </button>
                  {session.statut !== 'annulee' && session.statut !== 'terminee' && (
                    <button
                      onClick={() => cancelSession.mutate(session._id)}
                      className="text-red-600 hover:underline"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {publishSession.isError && (
        <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">
          {(publishSession.error as Error).message}
        </p>
      )}
    </div>
  );
}
