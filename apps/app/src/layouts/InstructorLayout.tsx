import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

const links = [
  { to: '/moniteur', label: 'Planning' },
  { to: '/moniteur/disponibilites', label: 'Disponibilites' },
  { to: '/moniteur/heures', label: 'Heures' },
];

export default function InstructorLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-800">
          {user?.prenom} {user?.nom}
        </span>
        <button onClick={handleLogout} className="text-sm text-slate-600 hover:underline">
          Se deconnecter
        </button>
      </header>

      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t bg-white">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/moniteur'}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm ${isActive ? 'font-semibold text-slate-900' : 'text-slate-500'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
