import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { ApiError } from '../src/middleware/errorHandler.js';
import { City } from '../src/models/City.js';
import { ExamSlot } from '../src/models/ExamSlot.js';
import { Formula } from '../src/models/Formula.js';
import { MeetingPoint } from '../src/models/MeetingPoint.js';
import { Session } from '../src/models/Session.js';
import { User } from '../src/models/User.js';
import { publishSession } from '../src/services/session.service.js';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/testDb.js';

beforeAll(async () => {
  await startTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

async function createBaseSession(placesTotal: number, examSlotId?: string) {
  const city = await City.create({ slug: 'ville-test', nom: 'Ville test' });
  const meetingPoint = await MeetingPoint.create({
    cityId: city._id,
    nom: 'Point test',
    adresse: '1 rue du test',
    location: { type: 'Point', coordinates: [0, 0] },
    boites: ['manuelle'],
  });
  const formula = await Formula.create({
    slug: 'formule-test',
    nom: 'Formule test',
    categorie: 'voiture',
    boite: 'manuelle',
    dureeJours: 1,
    prix: 10000,
  });
  const instructor = await User.create({
    email: 'moniteur@test.local',
    motDePasseHash: 'hash',
    role: 'moniteur',
    prenom: 'Moniteur',
    nom: 'Test',
    telephone: '0600000000',
  });

  return Session.create({
    formulaId: formula._id,
    meetingPointId: meetingPoint._id,
    instructorId: instructor._id,
    examSlotId,
    dates: [{ jour: new Date(), heureDebut: '09:00', heureFin: '17:00' }],
    placesTotal,
    placesRestantes: placesTotal,
    statut: 'brouillon',
  });
}

describe("regle d'examen garanti", () => {
  it('refuse la publication sans examSlot rattache', async () => {
    const session = await createBaseSession(5);

    await expect(publishSession(session._id)).rejects.toMatchObject({
      code: 'EXAM_SLOT_REQUIRED',
    } satisfies Partial<ApiError>);
  });

  it("refuse la publication si l'examSlot n'a pas assez de places", async () => {
    const city = await City.create({ slug: 'ville-test-2', nom: 'Ville test 2' });
    const examSlot = await ExamSlot.create({
      cityId: city._id,
      date: new Date(),
      centreExamen: 'Centre test',
      placesTotal: 3,
      placesAffectees: 0,
    });
    const session = await createBaseSession(5, examSlot._id.toString());

    await expect(publishSession(session._id)).rejects.toMatchObject({
      code: 'INSUFFICIENT_EXAM_SLOTS',
    } satisfies Partial<ApiError>);
  });

  it('publie la session et alloue les places quand le examSlot a assez de capacite', async () => {
    const city = await City.create({ slug: 'ville-test-3', nom: 'Ville test 3' });
    const examSlot = await ExamSlot.create({
      cityId: city._id,
      date: new Date(),
      centreExamen: 'Centre test',
      placesTotal: 10,
      placesAffectees: 0,
    });
    const session = await createBaseSession(5, examSlot._id.toString());

    const published = await publishSession(session._id);

    expect(published.statut).toBe('publiee');

    const updatedSlot = await ExamSlot.findById(examSlot._id);
    expect(updatedSlot?.placesAffectees).toBe(5);
  });
});
