import { useState } from 'react';
import { useSessionsAdmin } from '../sessions/useSessionsAdmin.js';
import { populatedId, populatedLabel } from '../../types/admin.js';
import {
  useBookingsAdmin,
  useForceCancelBooking,
  useForceRescheduleBooking,
} from './useBookingsAdmin.js';

export default function BookingsAdminPage(): JSX.Element {
  const { data: bookings, isLoading } = useBookingsAdmin();
  const { data: sessions } = useSessionsAdmin();
  const forceCancel = useForceCancelBooking();
  const forceReschedule = useForceRescheduleBooking();

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [targetSessionId, setTargetSessionId] = useState('');

  function sessionLabel(sessionId: string): string {
    const session = sessions?.find((s) => s._id === sessionId);
    if (!session) return sessionId;
    const premierJour = session.dates[0]?.jour;
    return `${populatedLabel(session.formulaId)} — ${premierJour ? new Date(premierJour).toLocaleDateString('fr-FR') : ''}`;
  }

  async function handleCancel(bookingId: string): Promise<void> {
    const motif = window.prompt("Motif de l'annulation forcee (obligatoire) :");
    if (!motif) return;
    await forceCancel.mutateAsync({ id: bookingId, input: { motif } });
  }

  function startReschedule(bookingId: string): void {
    setReschedulingId(bookingId);
    setTargetSessionId('');
  }

  async function confirmReschedule(bookingId: string): Promise<void> {
    if (!targetSessionId) return;
    await forceReschedule.mutateAsync({ id: bookingId, input: { newSessionId: targetSessionId } });
    setReschedulingId(null);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Reservations</h1>
      <p className="mb-4 text-sm text-slate-500">
        Annulation et report forces ici contournent les regles standard (delais CGV) : a reserver
        aux cas exceptionnels, chaque action est tracee dans les logs d&apos;audit.
      </p>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Eleve</th>
              <th className="p-2">Session</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Statut</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => (
              <tr key={booking._id} className="border-b align-top">
                <td className="p-2">{populatedLabel(booking.studentId)}</td>
                <td className="p-2">{sessionLabel(populatedId(booking.sessionId))}</td>
                <td className="p-2">{(booking.montantTotal / 100).toFixed(2)} EUR</td>
                <td className="p-2">{booking.statut}</td>
                <td className="p-2">
                  {booking.statut !== 'annulee' && booking.statut !== 'terminee' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={forceCancel.isPending}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Annuler
                      </button>
                      {reschedulingId === booking._id ? (
                        <>
                          <select
                            value={targetSessionId}
                            onChange={(e) => setTargetSessionId(e.target.value)}
                            className="rounded border px-1 py-0.5 text-sm"
                          >
                            <option value="">Nouvelle session...</option>
                            {sessions?.map((s) => (
                              <option key={s._id} value={s._id}>
                                {sessionLabel(s._id)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => confirmReschedule(booking._id)}
                            disabled={!targetSessionId || forceReschedule.isPending}
                            className="text-green-700 hover:underline disabled:opacity-50"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setReschedulingId(null)}
                            className="text-slate-500 hover:underline"
                          >
                            Fermer
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startReschedule(booking._id)}
                          className="text-slate-700 hover:underline"
                        >
                          Reporter
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
