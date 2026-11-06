import { downloadFile } from '../../lib/apiClient.js';
import { populatedLabel } from '../../types/admin.js';
import { usePaymentsAdmin } from './usePaymentsAdmin.js';

export default function PaymentsAdminPage(): JSX.Element {
  const { data: payments, isLoading } = usePaymentsAdmin();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Paiements</h1>
        <button
          onClick={() => downloadFile('/admin/payments/export.csv', 'paiements.csv')}
          className="rounded bg-slate-800 px-4 py-1.5 text-sm text-white"
        >
          Exporter CSV
        </button>
      </div>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Date</th>
              <th className="p-2">Eleve</th>
              <th className="p-2">Formule</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Facture</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => (
              <tr key={payment._id} className="border-b">
                <td className="p-2">{new Date(payment.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="p-2">
                  {typeof payment.bookingId === 'string'
                    ? ''
                    : populatedLabel(payment.bookingId.studentId)}
                </td>
                <td className="p-2">
                  {typeof payment.bookingId !== 'string' &&
                  typeof payment.bookingId.sessionId !== 'string'
                    ? populatedLabel(payment.bookingId.sessionId.formulaId)
                    : ''}
                </td>
                <td className="p-2">{(payment.montant / 100).toFixed(2)} EUR</td>
                <td className="p-2">{payment.statut}</td>
                <td className="p-2">{payment.numeroFacture ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
