import PDFDocument from 'pdfkit';
import { getNextSequence } from './counter.service.js';
import type { FormulaDocument } from '../models/Formula.js';
import type { PaymentDocument } from '../models/Payment.js';
import type { UserDocument } from '../models/User.js';

/** Numero de facture a sequence continue, format FAC-<annee>-<sequence sur 6 chiffres>. */
export async function assignInvoiceNumber(payment: PaymentDocument): Promise<string> {
  const year = new Date().getFullYear();
  const sequence = await getNextSequence(`invoice-${year}`);
  const numeroFacture = `FAC-${year}-${String(sequence).padStart(6, '0')}`;

  payment.numeroFacture = numeroFacture;
  await payment.save();

  return numeroFacture;
}

export interface InvoiceData {
  payment: PaymentDocument;
  student: UserDocument;
  formula: FormulaDocument;
}

/** Genere la facture PDF en memoire (pas de persistance : regeneree a chaque telechargement). */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const { payment, student, formula } = data;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('[NOM] — Facture', { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#555555');
    doc.text(`Facture n° ${payment.numeroFacture ?? '(non attribue)'}`);
    doc.text(`Date de paiement : ${payment.payeLe?.toLocaleDateString('fr-FR') ?? '-'}`);
    doc.moveDown();

    doc.fillColor('#000000').fontSize(12).text('Client');
    doc.fontSize(10).text(`${student.prenom} ${student.nom}`);
    doc.text(student.email);
    doc.moveDown();

    doc.fontSize(12).text('Prestation');
    doc.fontSize(10).text(formula.nom);
    doc.moveDown();

    doc.fontSize(12).text('Montant');
    doc.fontSize(14).text(`${(payment.montant / 100).toFixed(2)} EUR TTC`);
    doc.moveDown();

    doc.fontSize(9).fillColor('#888888').text(`Prestataire de paiement : ${payment.prestataire}`);
    doc.text(`Reference : ${payment.referencePrestataire ?? '-'}`);

    doc.end();
  });
}
