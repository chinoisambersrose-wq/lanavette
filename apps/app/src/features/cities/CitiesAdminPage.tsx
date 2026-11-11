import { GEARBOXES } from 'shared';
import { useState, type FormEvent } from 'react';
import {
  useCitiesAdmin,
  useCreateCity,
  useCreateMeetingPoint,
  useDeleteMeetingPoint,
  useMeetingPointsAdmin,
  useUpdateCity,
} from './useCitiesAdmin.js';

export default function CitiesAdminPage(): JSX.Element {
  const { data: cities, isLoading } = useCitiesAdmin();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const [cityForm, setCityForm] = useState({ slug: '', nom: '' });
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(undefined);

  const selectedCity = cities?.find((c) => c._id === selectedCityId);
  const { data: meetingPoints } = useMeetingPointsAdmin(selectedCity?.slug);
  const createMeetingPoint = useCreateMeetingPoint(selectedCityId ?? '');
  const deleteMeetingPoint = useDeleteMeetingPoint();

  const [pointForm, setPointForm] = useState({
    nom: '',
    adresse: '',
    lat: 0,
    lng: 0,
    boites: [...GEARBOXES],
  });

  async function handleCreateCity(event: FormEvent): Promise<void> {
    event.preventDefault();
    await createCity.mutateAsync(cityForm);
    setCityForm({ slug: '', nom: '' });
  }

  async function handleCreatePoint(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!selectedCityId) return;
    await createMeetingPoint.mutateAsync({
      nom: pointForm.nom,
      adresse: pointForm.adresse,
      location: { type: 'Point', coordinates: [pointForm.lng, pointForm.lat] },
      boites: pointForm.boites,
    });
    setPointForm({ nom: '', adresse: '', lat: 0, lng: 0, boites: [...GEARBOXES] });
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Villes et points de RDV</h1>

      <form onSubmit={handleCreateCity} className="mb-6 flex gap-3 rounded border bg-white p-4">
        <input
          placeholder="slug"
          required
          value={cityForm.slug}
          onChange={(e) => setCityForm({ ...cityForm, slug: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <input
          placeholder="Nom de la ville"
          required
          value={cityForm.nom}
          onChange={(e) => setCityForm({ ...cityForm, nom: e.target.value })}
          className="rounded border px-2 py-1"
        />
        <button type="submit" className="rounded bg-slate-800 px-3 py-1 text-white">
          Ajouter la ville
        </button>
      </form>
      <p className="mb-4 text-sm text-slate-500">
        Une nouvelle ville reste masquée aux élèves. Activez-la uniquement lorsqu’elle est
        réellement desservie.
      </p>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ul className="rounded border bg-white">
            {cities?.map((city) => (
              <li key={city._id} className="flex items-center justify-between gap-2 border-b p-2">
                <button
                  type="button"
                  onClick={() => setSelectedCityId(city._id)}
                  className={`text-left ${selectedCityId === city._id ? 'font-semibold' : ''}`}
                >
                  {city.nom} ({city.slug}) — {city.actif ? 'desservie' : 'masquée'}
                </button>
                <button
                  type="button"
                  onClick={() => updateCity.mutate({ id: city._id, input: { actif: !city.actif } })}
                  disabled={updateCity.isPending}
                  className="text-sm text-indigo-700 hover:underline disabled:opacity-50"
                >
                  {city.actif ? 'Masquer' : 'Marquer desservie'}
                </button>
              </li>
            ))}
          </ul>

          <div>
            {selectedCity ? (
              <>
                <h2 className="mb-2 font-medium">Points de RDV — {selectedCity.nom}</h2>
                <ul className="mb-4 rounded border bg-white">
                  {meetingPoints?.map((point) => (
                    <li key={point._id} className="flex items-center justify-between p-2">
                      <span>
                        {point.nom} — {point.adresse}
                      </span>
                      <button
                        onClick={() => deleteMeetingPoint.mutate(point._id)}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>

                <form
                  onSubmit={handleCreatePoint}
                  className="grid grid-cols-2 gap-2 rounded border bg-white p-3"
                >
                  <input
                    placeholder="Nom du point de RDV"
                    required
                    value={pointForm.nom}
                    onChange={(e) => setPointForm({ ...pointForm, nom: e.target.value })}
                    className="col-span-2 rounded border px-2 py-1"
                  />
                  <input
                    placeholder="Adresse"
                    required
                    value={pointForm.adresse}
                    onChange={(e) => setPointForm({ ...pointForm, adresse: e.target.value })}
                    className="col-span-2 rounded border px-2 py-1"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={pointForm.lat}
                    onChange={(e) => setPointForm({ ...pointForm, lat: Number(e.target.value) })}
                    className="rounded border px-2 py-1"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={pointForm.lng}
                    onChange={(e) => setPointForm({ ...pointForm, lng: Number(e.target.value) })}
                    className="rounded border px-2 py-1"
                  />
                  <button type="submit" className="col-span-2 rounded bg-slate-800 py-1 text-white">
                    Ajouter le point de RDV
                  </button>
                </form>
              </>
            ) : (
              <p className="text-slate-500">Selectionnez une ville.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
