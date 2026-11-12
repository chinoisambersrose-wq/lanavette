import { useState } from 'react';
import { snapchatUrl, whatsappUrl } from '../lib/contact.js';

interface Props {
  message: string;
  className?: string;
}

export default function LeadContactForm({ message, className = '' }: Props): JSX.Element {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');

  const ready = Boolean(prenom.trim() && nom.trim() && telephone.trim());
  const fullMessage = `Bonjour, je m'appelle ${prenom.trim()} ${nom.trim()} (tel: ${telephone.trim()}). ${message}`;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Prénom"
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom"
          className="rounded border px-2 py-1 text-sm"
        />
        <input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Téléphone"
          type="tel"
          className="rounded border px-2 py-1 text-sm"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          href={ready ? whatsappUrl(fullMessage) : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
          className={`rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 ${
            ready ? '' : 'pointer-events-none opacity-50'
          }`}
        >
          WhatsApp
        </a>
        <a
          href={snapchatUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Snapchat
        </a>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Renseignez vos coordonnées pour que le message WhatsApp les inclue automatiquement.
      </p>
    </div>
  );
}
