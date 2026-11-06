import { Link } from 'react-router-dom';
import { useFormulasCatalog } from '../features/catalog/useCatalog.js';

export default function CatalogPage(): JSX.Element {
  const { data: formulas, isLoading } = useFormulasCatalog();

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Nos formules</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {formulas?.map((formula) => (
          <div key={formula._id} className="rounded-lg border bg-white p-4 shadow-sm">
            {formula.badge && (
              <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                {formula.badge}
              </span>
            )}
            <h2 className="text-lg font-semibold text-slate-800">{formula.nom}</h2>
            <p className="text-sm text-slate-500">
              Boite {formula.boite} · {formula.dureeJours} jour(s)
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {(formula.prix / 100).toFixed(0)} EUR
            </p>
            {formula.mensualiteAffichee && (
              <p className="text-sm text-slate-500">
                dès {(formula.mensualiteAffichee / 100).toFixed(0)} EUR/mois
              </p>
            )}
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {formula.pointsCles.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
            <Link
              to={`/sessions?formula=${formula.slug}`}
              className="mt-4 inline-block rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
            >
              Voir les dates
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
