import { snapchatUrl, whatsappUrl } from '../lib/contact.js';

interface Props {
  message: string;
  className?: string;
}

export default function ContactButtons({ message, className = '' }: Props): JSX.Element {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
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
  );
}
