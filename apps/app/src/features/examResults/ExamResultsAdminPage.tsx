import { EXAM_RESULTS, type ExamResultValue } from 'shared';
import { useState, type FormEvent } from 'react';
import { populatedLabel } from '../../types/admin.js';
import {
  useBookingsAdmin,
  useCreateExamResult,
  useExamResultStats,
  useExamResultsAdmin,
} from './useExamResultsAdmin.js';

export default function ExamResultsAdminPage(): JSX.Element {
  const { data: results, isLoading } = useExamResultsAdmin();
  const { data: bookings } = useBookingsAdmin();
  const { data: stats } = useExamResultStats('formula');
  const createExamResult = useCreateExamResult();

  const eligibleBookings = bookings?.filter((b) => b.statut === 'confirmee');

  const [bookingId, setBookingId] = useState('');
  const [resultat, setResultat] = useState<ExamResultValue>('admis');

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const booking = bookings?.find((b) => b._id === bookingId);
    const examSlotId =
      booking && typeof booking.sessionId !== 'string' ? booking.sessionId.examSlotId : undefined;

    if (!booking || !examSlotId) return;

    await createExamResult.mutateAsync({
      bookingId,
      examSlotId,
      date: new Date().toISOString(),
      resultat,
    });
    setBookingId('');
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Resultats d&apos;examen</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-end gap-3 rounded border bg-white p-4"
      >
        <select
          required
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">Reservation...</option>
          {eligibleBookings?.map((booking) => (
            <option key={booking._id} value={booking._id}>
              {populatedLabel(booking.studentId)} — {booking._id}
            </option>
          ))}
        </select>
        <select
          value={resultat}
          onChange={(e) => setResultat(e.target.value as ExamResultValue)}
          className="rounded border px-2 py-1"
        >
          {EXAM_RESULTS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-slate-800 px-4 py-1.5 text-white">
          Enregistrer
        </button>
      </form>

      <h2 className="mb-2 text-base font-semibold text-slate-800">Taux de reussite par formule</h2>
      <table className="mb-6 w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="p-2">Formule</th>
            <th className="p-2">Admis</th>
            <th className="p-2">Ajourne</th>
            <th className="p-2">Absent</th>
            <th className="p-2">Taux</th>
          </tr>
        </thead>
        <tbody>
          {stats?.map((row) => (
            <tr key={row.key} className="border-b">
              <td className="p-2">{row.label}</td>
              <td className="p-2">{row.admis}</td>
              <td className="p-2">{row.ajourne}</td>
              <td className="p-2">{row.absent}</td>
              <td className="p-2">{row.tauxReussite}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-2 text-base font-semibold text-slate-800">Historique</h2>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Eleve</th>
              <th className="p-2">Formule</th>
              <th className="p-2">Date</th>
              <th className="p-2">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {results?.map((result) => (
              <tr key={result._id} className="border-b">
                <td className="p-2">
                  {typeof result.bookingId === 'string'
                    ? ''
                    : populatedLabel(result.bookingId.studentId)}
                </td>
                <td className="p-2">
                  {typeof result.bookingId !== 'string' &&
                  typeof result.bookingId.sessionId !== 'string'
                    ? populatedLabel(result.bookingId.sessionId.formulaId)
                    : ''}
                </td>
                <td className="p-2">{new Date(result.date).toLocaleDateString('fr-FR')}</td>
                <td className="p-2">{result.resultat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
