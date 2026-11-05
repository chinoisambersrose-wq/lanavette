import { FORMULA_CATEGORIES, GEARBOXES, type FormulaCategory, type Gearbox } from 'shared';
import { useState, type FormEvent } from 'react';
import { useArchiveFormula, useCreateFormula, useFormulasAdmin } from './useFormulasAdmin.js';

const emptyForm = {
  slug: '',
  nom: '',
  categorie: FORMULA_CATEGORIES[0] as FormulaCategory,
  boite: GEARBOXES[0] as Gearbox,
  dureeJours: 1,
  prix: 0,
};

export default function FormulasAdminPage(): JSX.Element {
  const { data: formulas, isLoading } = useFormulasAdmin();
  const createFormula = useCreateFormula();
  const archiveFormula = useArchiveFormula();
  const [form, setForm] = useState(emptyForm);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    await createFormula.mutateAsync({ ...form, pointsCles: [] });
    setForm(emptyForm);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Formules</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-2 gap-3 rounded border bg-white p-4 md:grid-cols-6"
      >
        <input
          placeholder="slug"
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <input
          placeholder="Nom"
          required
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <select
          value={form.categorie}
          onChange={(e) => setForm({ ...form, categorie: e.target.value as FormulaCategory })}
          className="rounded border px-2 py-1"
        >
          {FORMULA_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={form.boite}
          onChange={(e) => setForm({ ...form, boite: e.target.value as Gearbox })}
          className="rounded border px-2 py-1"
        >
          {GEARBOXES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Duree (jours)"
          required
          value={form.dureeJours}
          onChange={(e) => setForm({ ...form, dureeJours: Number(e.target.value) })}
          className="rounded border px-2 py-1"
        />
        <input
          type="number"
          min={0}
          placeholder="Prix (centimes)"
          required
          value={form.prix}
          onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
          className="rounded border px-2 py-1"
        />
        <button
          type="submit"
          disabled={createFormula.isPending}
          className="col-span-2 rounded bg-slate-800 py-1 text-white md:col-span-1"
        >
          Creer
        </button>
      </form>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Nom</th>
              <th className="p-2">Categorie</th>
              <th className="p-2">Boite</th>
              <th className="p-2">Prix</th>
              <th className="p-2">Actif</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {formulas?.map((formula) => (
              <tr key={formula._id} className="border-b">
                <td className="p-2">{formula.nom}</td>
                <td className="p-2">{formula.categorie}</td>
                <td className="p-2">{formula.boite}</td>
                <td className="p-2">{(formula.prix / 100).toFixed(2)} EUR</td>
                <td className="p-2">{formula.actif ? 'Oui' : 'Non'}</td>
                <td className="p-2">
                  {formula.actif && (
                    <button
                      onClick={() => archiveFormula.mutate(formula._id)}
                      className="text-red-600 hover:underline"
                    >
                      Archiver
                    </button>
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
