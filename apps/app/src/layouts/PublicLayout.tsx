import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function PublicLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Link to="/formules" className="text-lg font-semibold text-slate-800">
          [NOM]
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/formules" className="text-slate-600 hover:underline">
            Formules
          </Link>
          {user ? (
            <>
              <Link to="/mon-compte" className="text-slate-600 hover:underline">
                Mon compte
              </Link>
              <button onClick={handleLogout} className="text-slate-600 hover:underline">
                Se deconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:underline">
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="rounded bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Je m&apos;inscris
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
