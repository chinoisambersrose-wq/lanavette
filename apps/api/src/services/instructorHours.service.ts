import PDFDocument from 'pdfkit';
import type { Types } from 'mongoose';
import { Lesson } from '../models/Lesson.js';
import type { UserDocument } from '../models/User.js';

export interface MonthlyHoursSummary {
  month: string;
  totalHeures: number;
  nombreLecons: number;
}

/** Borne [debut, fin[ du mois au format "YYYY-MM" (UTC, coherent avec les dates stockees en base). */
function monthBounds(month: string): { start: Date; end: Date } {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year!, monthIndex! - 1, 1));
  const end = new Date(Date.UTC(year!, monthIndex!, 1));
  return { start, end };
}

/** Recapitulatif mensuel des heures enseignees par un moniteur (section 7 : paie / facturation independants). */
export async function getMonthlyHoursSummary(
  instructorId: Types.ObjectId | string,
  month: string,
): Promise<MonthlyHoursSummary> {
  const { start, end } = monthBounds(month);

  const lessons = await Lesson.find({
    instructorId,
    date: { $gte: start, $lt: end },
  }).select('heures');

  const totalHeures = lessons.reduce((sum, lesson) => sum + lesson.heures, 0);

  return { month, totalHeures, nombreLecons: lessons.length };
}

/** Genere le PDF du recapitulatif mensuel (en memoire, comme les factures : pas de persistance). */
export async function generateHoursSummaryPdf(
  instructor: UserDocument,
  summary: MonthlyHoursSummary,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('NAVETTE — Recapitulatif mensuel des heures', { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#555555');
    doc.text(`Moniteur : ${instructor.prenom} ${instructor.nom}`);
    doc.text(`Mois : ${summary.month}`);
    doc.moveDown();

    doc.fillColor('#000000').fontSize(12).text('Total');
    doc.fontSize(14).text(`${summary.totalHeures} heures sur ${summary.nombreLecons} lecon(s)`);

    doc.end();
  });
}
