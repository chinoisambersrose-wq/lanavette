import { City } from '../../src/models/City.js';
import { ExamSlot } from '../../src/models/ExamSlot.js';
import { Formula } from '../../src/models/Formula.js';
import { MeetingPoint } from '../../src/models/MeetingPoint.js';
import { Session, type SessionDocument } from '../../src/models/Session.js';
import { User, type UserDocument } from '../../src/models/User.js';

let counter = 0;

/** Cree une session publiee avec assez de places d'examen, prete a recevoir des reservations. */
export async function createPublishedSession(placesTotal = 1): Promise<SessionDocument> {
  counter += 1;

  const city = await City.create({
    slug: `ville-fixture-${counter}`,
    nom: `Ville fixture ${counter}`,
  });
  const meetingPoint = await MeetingPoint.create({
    cityId: city._id,
    nom: 'Point fixture',
    adresse: '1 rue fixture',
    location: { type: 'Point', coordinates: [0, 0] },
    boites: ['manuelle'],
  });
  const formula = await Formula.create({
    slug: `formule-fixture-${counter}`,
    nom: 'Formule fixture',
    categorie: 'voiture',
    boite: 'manuelle',
    dureeJours: 1,
    prix: 10000,
  });
  const instructor = await User.create({
    email: `moniteur-fixture-${counter}@test.local`,
    motDePasseHash: 'hash',
    role: 'moniteur',
    prenom: 'Moniteur',
    nom: 'Fixture',
    telephone: '0600000000',
  });
  const examSlot = await ExamSlot.create({
    cityId: city._id,
    date: new Date(),
    centreExamen: 'Centre fixture',
    placesTotal: placesTotal + 10,
    placesAffectees: 0,
  });

  const session = await Session.create({
    formulaId: formula._id,
    meetingPointId: meetingPoint._id,
    instructorId: instructor._id,
    examSlotId: examSlot._id,
    dates: [{ jour: new Date(), heureDebut: '09:00', heureFin: '17:00' }],
    placesTotal,
    placesRestantes: placesTotal,
    statut: 'brouillon',
  });

  session.statut = 'publiee';
  examSlot.placesAffectees += placesTotal;
  await Promise.all([session.save(), examSlot.save()]);

  return session;
}

export async function createStudent(): Promise<UserDocument> {
  counter += 1;

  return User.create({
    email: `eleve-fixture-${counter}@test.local`,
    motDePasseHash: 'hash',
    role: 'eleve',
    prenom: 'Eleve',
    nom: 'Fixture',
    telephone: '0600000000',
  });
}
