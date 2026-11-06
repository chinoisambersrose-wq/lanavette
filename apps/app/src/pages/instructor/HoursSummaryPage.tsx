import { useState } from 'react';
import { downloadFile } from '../../lib/apiClient.js';
import { useHoursSummary } from '../../features/instructor/useHoursSummary.js';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function HoursSummaryPage(): JSX.Element {
  const [month, setMonth] = useState(currentMonth());
  const { data: summary, isLoading } = useHoursSummary(month);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-800">Recapitulatif mensuel</h1>

      <label className="block text-sm">
        Mois
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-1 block rounded border px-2 py-1"
        />
      </label>

      {isLoading ? (
        <p>Chargement...</p>
      ) : summary ? (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{summary.totalHeures} heures</p>
          <p className="text-sm text-slate-500">{summary.nombreLecons} lecon(s)</p>

          <button
            onClick={() =>
              downloadFile(
                `/instructor/hours-summary/export.pdf?month=${month}`,
                `heures-${month}.pdf`,
              )
            }
            className="mt-4 rounded bg-slate-800 px-4 py-2 text-sm text-white"
          >
            Telecharger le PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}
