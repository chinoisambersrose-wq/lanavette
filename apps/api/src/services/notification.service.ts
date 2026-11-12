import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const BREVO_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_SMS_URL = 'https://api.brevo.com/v3/transactionalSMS/sms';

/** Adresse d'invitation Trustpilot (transfert automatique : Trustpilot invite le destinataire a laisser un avis). */
const TRUSTPILOT_INVITE_EMAIL = 'lanavete.com+8b305bac09@invite.trustpilot.com';

/**
 * Envoie un email transactionnel via Brevo. Sans `BREVO_API_KEY` (dev/preprod sans compte),
 * l'envoi est seulement journalise : meme comportement de gating que Stripe/S3/Alma.
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  bcc?: string[],
): Promise<void> {
  if (!env.BREVO_API_KEY) {
    logger.info({ to, subject }, '[notification email non envoyee, BREVO_API_KEY absente]');
    return;
  }

  const response = await fetch(BREVO_EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      ...(bcc?.length ? { bcc: bcc.map((email) => ({ email })) } : {}),
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    logger.error({ to, subject, status: response.status }, "Echec de l'envoi d'email via Brevo");
  }
}

/** Envoie un SMS transactionnel via Brevo. Sans cle, journalise seulement (meme logique que sendEmail). */
export async function sendSms(to: string, content: string): Promise<void> {
  if (!env.BREVO_API_KEY) {
    logger.info({ to }, '[notification SMS non envoyee, BREVO_API_KEY absente]');
    return;
  }

  const response = await fetch(BREVO_SMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: env.BREVO_SMS_SENDER,
      recipient: to,
      content,
      type: 'transactional',
    }),
  });

  if (!response.ok) {
    logger.error({ to, status: response.status }, "Echec de l'envoi de SMS via Brevo");
  }
}

interface NotifyBookingConfirmedInput {
  studentEmail: string;
  studentTelephone: string;
  studentName: string;
  formulaName: string;
  instructorEmail: string;
  instructorName: string;
}

/** Evenement "Reservation confirmee" (CAHIER_DES_CHARGES.md section 13) : eleve (email+SMS), moniteur (email). */
export async function notifyBookingConfirmed(input: NotifyBookingConfirmedInput): Promise<void> {
  await Promise.all([
    sendEmail(
      input.studentEmail,
      'Votre reservation est confirmee',
      `<p>Bonjour ${input.studentName},</p><p>Votre reservation pour le stage "${input.formulaName}" est confirmee. Votre moniteur : ${input.instructorName}.</p>`,
    ),
    sendSms(input.studentTelephone, `Votre reservation pour "${input.formulaName}" est confirmee.`),
    sendEmail(
      input.instructorEmail,
      'Nouvel eleve dans votre session',
      `<p>Bonjour ${input.instructorName},</p><p>${input.studentName} vient de confirmer sa reservation pour "${input.formulaName}".</p>`,
    ),
  ]);
}

/** Evenement "Document refuse" : email a l'eleve. */
export async function notifyDocumentRejected(
  studentEmail: string,
  studentName: string,
  documentType: string,
): Promise<void> {
  await sendEmail(
    studentEmail,
    'Document refuse',
    `<p>Bonjour ${studentName},</p><p>Votre document "${documentType}" a ete refuse. Merci de le televerser a nouveau depuis votre espace eleve.</p>`,
  );
}

/** Evenement "Place liberee" : email+SMS au premier inscrit non notifie de la liste d'attente. */
export async function notifyWaitlistSpotAvailable(
  studentEmail: string,
  studentTelephone: string,
  studentName: string,
  formulaName: string,
): Promise<void> {
  await Promise.all([
    sendEmail(
      studentEmail,
      "Une place s'est liberee",
      `<p>Bonjour ${studentName},</p><p>Une place s'est liberee pour le stage "${formulaName}" que vous suiviez en liste d'attente. Reservez-la depuis votre espace eleve.</p>`,
    ),
    sendSms(studentTelephone, `Une place s'est liberee pour "${formulaName}". Reservez vite !`),
  ]);
}

/**
 * Evenement "Resultat saisi" : email a l'eleve. Si admis, transfert en copie a Trustpilot
 * pour declencher automatiquement une invitation a laisser un avis.
 */
export async function notifyExamResult(
  studentEmail: string,
  studentName: string,
  resultat: string,
): Promise<void> {
  const base = `<p>Bonjour ${studentName},</p><p>Le resultat de votre examen a ete saisi : <strong>${resultat}</strong>.</p>`;
  const admis = resultat === 'admis';
  const avis = admis
    ? "<p>Felicitations ! N'hesitez pas a nous laisser un avis sur votre experience.</p>"
    : '';

  await sendEmail(
    studentEmail,
    'Resultat de votre examen',
    base + avis,
    admis ? [TRUSTPILOT_INVITE_EMAIL] : undefined,
  );
}

/** Avis de fin de stage "pas pret" (CAHIER_DES_CHARGES.md section 7) : alerte email a tous les admins. */
export async function notifyAdminNotReady(
  adminEmails: string[],
  studentName: string,
  formulaName: string,
): Promise<void> {
  await Promise.all(
    adminEmails.map((email) =>
      sendEmail(
        email,
        `Avis moniteur : eleve pas pret (${studentName})`,
        `<p>Le moniteur a indique que ${studentName} n'est pas pret pour l'examen (stage "${formulaName}"). Une action peut etre necessaire.</p>`,
      ),
    ),
  );
}
