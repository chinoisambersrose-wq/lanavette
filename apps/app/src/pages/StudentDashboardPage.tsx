import { DOCUMENT_TYPES, type DocumentType } from 'shared';
import { useState, type ChangeEvent } from 'react';
import { downloadFile } from '../lib/apiClient.js';
import {
  useCancelMyBooking,
  useCheckoutMyBooking,
  useMyBookings,
} from '../features/student/useMyBookings.js';
import { useMyDocuments, useUploadMyDocument } from '../features/student/useMyDocuments.js';
import { useMyPayments } from '../features/student/useMyPayments.js';
import { populatedLabel } from '../types/admin.js';

const STATUT_LABELS: Record<string, string> = {
  en_attente_paiement: 'En attente de paiement',
  confirmee: 'Confirmee',
  reportee: 'Reportee',
  annulee: 'Annulee',
  terminee: 'Terminee',
};

export default function StudentDashboardPage(): JSX.Element {
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: payments } = useMyPayments();
  const { data: documents } = useMyDocuments();
  const cancelBooking = useCancelMyBooking();
  const checkoutBooking = useCheckoutMyBooking();
  const uploadDocument = useUploadMyDocument();

  const [checkoutError, setCheckoutError] = useState<string | undefined>(undefined);
  const [uploadType, setUploadType] = useState<DocumentType>(DOCUMENT_TYPES[0]);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  const nextConfirmed = bookings
    ?.filter((b) => b.statut === 'confirmee')
    .sort(
      (a, b) =>
        new Date(a.sessionId.dates[0]?.jour ?? 0).getTime() -
        new Date(b.sessionId.dates[0]?.jour ?? 0).getTime(),
    )[0];

  async function handleCheckout(bookingId: string): Promise<void> {
    setCheckoutError(undefined);
    try {
      const result = await checkoutBooking.mutateAsync(bookingId);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Paiement indisponible');
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    setUploadError(undefined);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadDocument.mutateAsync({ type: uploadType, file });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Televersement impossible');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800">Mon compte</h1>

      {nextConfirmed && (
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-800">Prochain stage</h2>
          <p className="text-sm text-slate-600">
            {populatedLabel(nextConfirmed.sessionId.formulaId)} —{' '}
            {new Date(nextConfirmed.sessionId.dates[0]?.jour ?? '').toLocaleDateString('fr-FR')}
          </p>
          <p className="text-sm text-slate-500">
            Moniteur : {populatedLabel(nextConfirmed.sessionId.instructorId)}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Mes reservations</h2>

        {checkoutError && (
          <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{checkoutError}</p>
        )}

        {bookingsLoading ? (
          <p>Chargement...</p>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {populatedLabel(booking.sessionId.formulaId)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {STATUT_LABELS[booking.statut] ?? booking.statut} ·{' '}
                    {(booking.montantTotal / 100).toFixed(2)} EUR
                  </p>
                </div>
                <div className="flex gap-2">
                  {booking.statut === 'en_attente_paiement' && (
                    <button
                      onClick={() => handleCheckout(booking._id)}
                      disabled={checkoutBooking.isPending}
                      className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                    >
                      Payer
                    </button>
                  )}
                  {(booking.statut === 'en_attente_paiement' || booking.statut === 'confirmee') && (
                    <button
                      onClick={() => cancelBooking.mutate(booking._id)}
                      disabled={cancelBooking.isPending}
                      className="rounded border px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Aucune reservation pour le moment.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Documents</h2>

        {uploadError && (
          <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{uploadError}</p>
        )}

        <div className="mb-3 flex items-center gap-3">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as (typeof DOCUMENT_TYPES)[number])}
            className="rounded border px-2 py-1 text-sm"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <label className="cursor-pointer rounded bg-slate-800 px-3 py-1.5 text-sm text-white">
            Televerser
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {documents && documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="flex items-center justify-between rounded border bg-white p-3 text-sm"
              >
                <span>
                  {doc.type} — {doc.statut}
                </span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:underline"
                >
                  Voir
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Aucun document televerse.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Paiements et factures</h2>

        {payments && payments.length > 0 ? (
          <ul className="space-y-2">
            {payments.map((payment) => (
              <li
                key={payment._id}
                className="flex items-center justify-between rounded border bg-white p-3 text-sm"
              >
                <span>
                  {(payment.montant / 100).toFixed(2)} EUR — {payment.statut}
                  {payment.numeroFacture ? ` (${payment.numeroFacture})` : ''}
                </span>
                {payment.statut === 'paye' && (
                  <button
                    onClick={() =>
                      downloadFile(
                        `/me/payments/${payment._id}/invoice`,
                        `${payment.numeroFacture ?? payment._id}.pdf`,
                      )
                    }
                    className="text-slate-600 hover:underline"
                  >
                    Telecharger la facture
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Aucun paiement pour le moment.</p>
        )}
      </section>
    </div>
  );
}
