import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, ApiClientError } from '../lib/apiClient.js';
import { useAuth } from '../auth/AuthContext.js';

export default function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    motDePasse: '',
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      await apiClient.post('/auth/register', form);
      // On se reconnecte via le contexte d'auth pour que le role/profil soient charges partout.
      await login(form.email, form.motDePasse);
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/mon-compte');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Inscription impossible');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Je m&apos;inscris</h1>

        {error && (
          <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="text-sm">
            Prenom
            <input
              required
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Nom
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="mb-3 block text-sm">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="mb-3 block text-sm">
          Telephone
          <input
            required
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="mb-4 block text-sm">
          Mot de passe (10 caracteres minimum)
          <input
            type="password"
            required
            minLength={10}
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-800 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Inscription...' : "M'inscrire"}
        </button>
      </form>
    </main>
  );
}
