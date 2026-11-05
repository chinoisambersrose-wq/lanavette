import { useState, type FormEvent } from 'react';
import { useCitiesAdmin } from '../cities/useCitiesAdmin.js';
import { useCreateExamSlot, useDeleteExamSlot, useExamSlotsAdmin } from './useExamSlotsAdmin.js';

export default function ExamSlotsAdminPage(): JSX.Element {
  const { data: examSlots, isLoading } = useExamSlotsAdmin();
  const { data: cities } = useCitiesAdmin();
  const createExamSlot = useCreateExamSlot();
  const deleteExamSlot = useDeleteExamSlot();

  const [form, setForm] = useState({ date: '', centreExamen: '', placesTotal: 1, cityId: '' });

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    await createExamSlot.mutateAsync(form);
    setForm({ date: '', centreExamen: '', placesTotal: 1, cityId: '' });
  }

  function cityName(cityId: string): string {
    return cities?.find((c) => c._id === cityId)?.nom ?? cityId;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Creneaux d&apos;examen</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-2 gap-3 rounded border bg-white p-4 md:grid-cols-5"
      >
        <select
          required
          value={form.cityId}
          onChange={(e) => setForm({ ...form, cityId: e.target.value })}
          className="rounded border px-2 py-1"
        >
          <option value="">Ville...</option>
          {cities?.map((city) => (
            <option key={city._id} value={city._id}>
              {city.nom}
            </option>
          ))}
        </select>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <input
          placeholder="Centre d'examen"
          required
          value={form.centreExamen}
          onChange={(e) => setForm({ ...form, centreExamen: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <input
          type="number"
          min={1}
          placeholder="Places totales"
          required
          value={form.placesTotal}
          onChange={(e) => setForm({ ...form, placesTotal: Number(e.target.value) })}
          className="rounded border px-2 py-1"
        />
        <button type="submit" className="rounded bg-slate-800 py-1 text-white">
          Creer
        </button>
      </form>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Date</th>
              <th className="p-2">Centre</th>
              <th className="p-2">Ville</th>
              <th className="p-2">Places affectees / totales</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {examSlots?.map((slot) => (
              <tr key={slot._id} className="border-b">
                <td className="p-2">{new Date(slot.date).toLocaleDateString('fr-FR')}</td>
                <td className="p-2">{slot.centreExamen}</td>
                <td className="p-2">{cityName(slot.cityId)}</td>
                <td className="p-2">
                  {slot.placesAffectees} / {slot.placesTotal}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => deleteExamSlot.mutate(slot._id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
