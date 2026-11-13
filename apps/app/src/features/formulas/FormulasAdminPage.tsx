import type { Formula } from '../../types/admin.js';
import { FORMULA_CATEGORIES, GEARBOXES, type FormulaCategory, type Gearbox } from 'shared';
import { useState, type FormEvent } from 'react';
import {
  useArchiveFormula,
  useCreateFormula,
  useFormulasAdmin,
  useUpdateFormula,
} from './useFormulasAdmin.js';

const emptyForm = {
  slug: '',
  nom: '',
  categorie: FORMULA_CATEGORIES[0] as FormulaCategory,
  boite: GEARBOXES[0] as Gearbox,
  dureeJours: 1,
  prix: 0,
  pointsCles: '',
};

function pointsClesToText(pointsCles: string[]): string {
  return pointsCles.join('\n');
}

function pointsClesFromText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function FormulasAdminPage(): JSX.Element {
  const { data: formulas, isLoading } = useFormulasAdmin();
  const createFormula = useCreateFormula();
  const updateFormula = useUpdateFormula();
  const archiveFormula = useArchiveFormula();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  function startEdit(formula: Formula): void {
    setEditingId(formula._id);
    setForm({
      slug: formula.slug,
      nom: formula.nom,
      categorie: formula.categorie,
      boite: formula.boite,
      dureeJours: formula.dureeJours,
      prix: formula.prix,
      pointsCles: pointsClesToText(formula.pointsCles),
    });
  }

  function cancelEdit(): void {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const input = { ...form, pointsCles: pointsClesFromText(form.pointsCles) };

    if (editingId) {
      await updateFormula.mutateAsync({ id: editingId, input });
      setEditingId(null);
    } else {
      await createFormula.mutateAsync(input);
    }

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
        <textarea
          placeholder="Points cles (un par ligne)"
          rows={3}
          value={form.pointsCles}
          onChange={(e) => setForm({ ...form, pointsCles: e.target.value })}
          className="col-span-2 rounded border px-2 py-1 md:col-span-6"
        />
        <button
          type="submit"
          disabled={createFormula.isPending || updateFormula.isPending}
          className="col-span-2 rounded bg-slate-800 py-1 text-white md:col-span-1"
        >
          {editingId ? 'Enregistrer' : 'Creer'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="col-span-2 rounded border py-1 text-slate-600 md:col-span-1"
          >
            Annuler
          </button>
        )}
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
                <td className="space-x-3 p-2">
                  <button
                    onClick={() => startEdit(formula)}
                    className="text-slate-700 hover:underline"
                  >
                    Modifier
                  </button>
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
