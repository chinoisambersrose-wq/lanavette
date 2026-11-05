import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

const links = [
  { to: '/admin/formulas', label: 'Formules' },
  { to: '/admin/cities', label: 'Villes & RDV' },
  { to: '/admin/exam-slots', label: "Creneaux d'examen" },
  { to: '/admin/sessions', label: 'Sessions' },
  { to: '/admin/students', label: 'Eleves' },
];

export default function AdminLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 flex-shrink-0 border-r bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Back-office</h2>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <span className="text-sm text-slate-500">
            {user?.prenom} {user?.nom} ({user?.role})
          </span>
          <button onClick={handleLogout} className="text-sm text-slate-600 hover:underline">
            Se deconnecter
          </button>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
