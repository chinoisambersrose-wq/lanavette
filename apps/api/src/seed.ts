import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { Booking } from './models/Booking.js';
import { City } from './models/City.js';
import { ExamSlot } from './models/ExamSlot.js';
import { Formula } from './models/Formula.js';
import { InstructorProfile } from './models/InstructorProfile.js';
import { Lesson } from './models/Lesson.js';
import { MeetingPoint } from './models/MeetingPoint.js';
import type { SessionDocument } from './models/Session.js';
import { Session } from './models/Session.js';
import { StudentProfile } from './models/StudentProfile.js';
import { User } from './models/User.js';
import { hashPassword } from './services/auth.service.js';
import { publishSession } from './services/session.service.js';

const DEMO_PASSWORD = 'Demo1234!';

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

async function seed(): Promise<void> {
  await connectDb(env.MONGODB_URI);

  logger.info('Nettoyage des collections de demo...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    InstructorProfile.deleteMany({}),
    Formula.deleteMany({}),
    City.deleteMany({}),
    MeetingPoint.deleteMany({}),
    ExamSlot.deleteMany({}),
    Session.deleteMany({}),
    Booking.deleteMany({}),
    Lesson.deleteMany({}),
  ]);

  const motDePasseHash = await hashPassword(DEMO_PASSWORD);

  logger.info('Creation des comptes de test...');
  const admin = await User.create({
    email: 'admin.demo@example.com',
    motDePasseHash,
    role: 'admin',
    prenom: '[DEMO]',
    nom: 'Admin',
    telephone: '0600000001',
  });

  const eleve = await User.create({
    email: 'eleve.demo@example.com',
    motDePasseHash,
    role: 'eleve',
    prenom: '[DEMO]',
    nom: 'Eleve',
    telephone: '0600000002',
  });
  await StudentProfile.create({ userId: eleve._id, codeObtenu: false });

  const instructor1 = await User.create({
    email: 'moniteur1.demo@example.com',
    motDePasseHash,
    role: 'moniteur',
    prenom: '[DEMO]',
    nom: 'Moniteur Un',
    telephone: '0600000003',
  });
  const instructor2 = await User.create({
    email: 'moniteur2.demo@example.com',
    motDePasseHash,
    role: 'moniteur',
    prenom: '[DEMO]',
    nom: 'Moniteur Deux',
    telephone: '0600000004',
  });

  const city = await City.create({ slug: 'ville-demo', nom: '[DEMO] Ville', actif: true });

  await InstructorProfile.create([
    {
      userId: instructor1._id,
      villes: [city._id],
      boites: ['manuelle', 'automatique'],
      statut: 'salarie',
      disponibilites: [{ debut: daysFromNow(1), fin: daysFromNow(30) }],
    },
    {
      userId: instructor2._id,
      villes: [city._id],
      boites: ['manuelle'],
      statut: 'independant',
    },
  ]);

  logger.info('Creation des points de RDV...');
  const meetingPoints = await MeetingPoint.create([
    {
      cityId: city._id,
      nom: '[DEMO] Point de RDV Centre',
      adresse: '1 place de la Demo, Ville Demo',
      location: { type: 'Point', coordinates: [4.85, 45.75] },
      boites: ['manuelle', 'automatique'],
    },
    {
      cityId: city._id,
      nom: '[DEMO] Point de RDV Nord',
      adresse: '2 avenue de la Demo, Ville Demo',
      location: { type: 'Point', coordinates: [4.86, 45.78] },
      boites: ['manuelle'],
    },
    {
      cityId: city._id,
      nom: '[DEMO] Point de RDV Sud',
      adresse: '3 rue de la Demo, Ville Demo',
      location: { type: 'Point', coordinates: [4.84, 45.72] },
      boites: ['automatique'],
    },
  ]);

  logger.info("Creation du creneau d'examen...");
  const examSlot = await ExamSlot.create({
    cityId: city._id,
    date: daysFromNow(21),
    centreExamen: '[DEMO] Centre examen',
    placesTotal: 20,
    placesAffectees: 0,
  });

  logger.info('Creation des formules...');
  const [maxiManuelle, maxiAutomatique, , conduiteAccompagnee, , , moto] = await Formula.create([
    {
      slug: 'stage-intensif-manuelle',
      nom: 'Stage intensif boite manuelle - 10 jours',
      categorie: 'voiture',
      boite: 'manuelle',
      heuresConduite: 20,
      dureeJours: 10,
      prix: 120000,
      mensualiteAffichee: 12000,
      pointsCles: [
        '1 moniteur unique du debut a la fin',
        "Date d'examen communiquee avant paiement",
        '20h de conduite incluses',
      ],
      badge: 'Le plus choisi',
      actif: true,
      ordre: 1,
    },
    {
      slug: 'stage-intensif-automatique',
      nom: 'Stage intensif boite automatique - 8 jours',
      categorie: 'voiture',
      boite: 'automatique',
      heuresConduite: 16,
      dureeJours: 8,
      prix: 105000,
      mensualiteAffichee: 10500,
      pointsCles: [
        '1 moniteur unique du debut a la fin',
        'Apprentissage rapide, ideal citadine',
        "Date d'examen communiquee avant paiement",
      ],
      actif: true,
      ordre: 2,
    },
    {
      slug: 'stage-accelere-express',
      nom: 'Stage accelere express - 5 jours',
      categorie: 'voiture',
      boite: 'manuelle',
      heuresConduite: 14,
      dureeJours: 5,
      prix: 89000,
      mensualiteAffichee: 8900,
      pointsCles: [
        'Pour les eleves proches du niveau examen',
        'Planning concentre sur une semaine',
        "Date d'examen communiquee avant paiement",
      ],
      actif: true,
      ordre: 3,
    },
    {
      slug: 'conduite-accompagnee',
      nom: 'Conduite accompagnee - stage preparatoire',
      categorie: 'conduite_accompagnee',
      boite: 'manuelle',
      heuresConduite: 20,
      dureeJours: 5,
      prix: 165000,
      mensualiteAffichee: 16500,
      pointsCles: ['RDV prealable obligatoire inclus', '1 moniteur unique', 'Ouvert des 15 ans'],
      actif: true,
      ordre: 4,
    },
    {
      slug: 'code-en-ligne',
      nom: 'Code en ligne illimite',
      categorie: 'code',
      boite: 'manuelle',
      dureeJours: 1,
      prix: 4500,
      pointsCles: [
        "Acces illimite jusqu'a l'examen",
        'Series corrigees et suivies',
        "Inscription a l'examen du code incluse",
      ],
      actif: true,
      ordre: 5,
    },
    {
      slug: 'stage-passerelle',
      nom: "Stage passerelle - apres echec a l'examen",
      categorie: 'passerelle',
      boite: 'manuelle',
      heuresConduite: 7,
      dureeJours: 1,
      prix: 55000,
      pointsCles: [
        "Pas besoin de repasser l'examen du code",
        'Remise a niveau ciblee sur vos points faibles',
        "Nouvelle date d'examen incluse",
      ],
      actif: true,
      ordre: 6,
    },
    {
      slug: 'stage-moto-a2',
      nom: 'Permis moto A2 accelere',
      categorie: 'moto',
      boite: 'manuelle',
      heuresConduite: 24,
      dureeJours: 6,
      prix: 145000,
      mensualiteAffichee: 14500,
      pointsCles: [
        'Epreuves plateau et circulation garanties',
        '1 moniteur unique specialise moto',
        'Ouvert des 18 ans',
      ],
      actif: true,
      ordre: 7,
    },
    {
      slug: 'stage-moto-perfectionnement',
      nom: 'Perfectionnement moto - 3 jours',
      categorie: 'moto',
      boite: 'manuelle',
      heuresConduite: 9,
      dureeJours: 3,
      prix: 75000,
      pointsCles: [
        'Pour les motards deja titulaires du permis A1',
        'Remise a niveau plateau et circulation',
        'Moniteur specialise moto',
      ],
      actif: true,
      ordre: 8,
    },
  ]);

  logger.info('Creation des sessions [DEMO]...');
  const sessionsToCreate = [
    {
      formula: maxiManuelle!,
      meetingPoint: meetingPoints[0]!,
      instructor: instructor1,
      startInDays: 14,
    },
    {
      formula: maxiAutomatique!,
      meetingPoint: meetingPoints[2]!,
      instructor: instructor2,
      startInDays: 18,
    },
    {
      formula: conduiteAccompagnee!,
      meetingPoint: meetingPoints[1]!,
      instructor: instructor1,
      startInDays: 10,
    },
    { formula: moto!, meetingPoint: meetingPoints[0]!, instructor: instructor2, startInDays: 25 },
  ];

  let firstSession: SessionDocument | undefined;

  for (const { formula, meetingPoint, instructor, startInDays } of sessionsToCreate) {
    const dureeJours = formula.dureeJours || 1;
    const dates = Array.from({ length: dureeJours }, (_, i) => ({
      jour: daysFromNow(startInDays + i),
      heureDebut: '09:00',
      heureFin: '17:00',
    }));

    const session = await Session.create({
      formulaId: formula._id,
      meetingPointId: meetingPoint._id,
      instructorId: instructor._id,
      examSlotId: examSlot._id,
      dates,
      placesTotal: 1,
      placesRestantes: 1,
      statut: 'brouillon',
    });

    await publishSession(session._id);
    firstSession ??= session;
  }

  logger.info("Creation d'une reservation confirmee avec une lecon [DEMO] (espace moniteur)...");
  if (firstSession) {
    const booking = await Booking.create({
      studentId: eleve._id,
      sessionId: firstSession._id,
      statut: 'confirmee',
      montantTotal: maxiManuelle!.prix,
      modePaiement: 'comptant',
    });
    firstSession.placesRestantes = 0;
    await firstSession.save();

    await Lesson.create({
      bookingId: booking._id,
      instructorId: firstSession.instructorId,
      date: new Date(),
      heures: 2,
      competences: ['Maitrise des commandes', 'Creneau'],
      commentaire: '[DEMO] Bon debut, a revoir : controles retroviseurs',
      presence: 'presente',
    });
  }

  logger.info('Seed termine.');
  logger.info(
    `Comptes de test (mot de passe "${DEMO_PASSWORD}") : admin=${admin.email}, eleve=${eleve.email}, moniteur=${instructor1.email}`,
  );
}

seed()
  .catch((err: unknown) => {
    logger.error({ err }, 'Echec du seed');
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectDb();
  });
