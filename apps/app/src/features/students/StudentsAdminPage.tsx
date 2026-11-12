import { useToggleUserActive, useUsersAdmin } from './useUsersAdmin.js';

export default function StudentsAdminPage(): JSX.Element {
  const { data: students, isLoading } = useUsersAdmin('eleve');
  const toggleActive = useToggleUserActive();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Eleves</h1>

      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="p-2">Nom</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actif</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {students?.map((student) => (
              <tr key={student._id} className="border-b">
                <td className="p-2">
                  {student.prenom} {student.nom}
                </td>
                <td className="p-2">{student.email}</td>
                <td className="p-2">{student.actif ? 'Oui' : 'Non'}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleActive.mutate({ id: student._id, actif: !student.actif })}
                    disabled={toggleActive.isPending}
                    className="text-indigo-700 hover:underline disabled:opacity-50"
                  >
                    {student.actif ? 'Desactiver' : 'Activer'}
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
