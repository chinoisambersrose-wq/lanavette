/** Specification OpenAPI minimale, servie via swagger-ui-express sur /api/docs en dev. */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Plateforme de permis accelere',
    version: '0.1.0',
    description:
      'Reservation de stages de permis accelere : catalogue, authentification, back-office admin.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Verifie que l\'API repond',
        tags: ['Technique'],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Cree un compte eleve',
        tags: ['Auth'],
        responses: { '201': { description: 'Compte cree' }, '409': { description: 'Email deja utilise' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Connexion par email / mot de passe',
        tags: ['Auth'],
        responses: { '200': { description: 'Connecte' }, '401': { description: 'Identifiants invalides' } },
      },
    },
    '/auth/refresh': {
      post: {
        summary: "Renouvelle le jeton d'acces a partir du cookie de rafraichissement",
        tags: ['Auth'],
        responses: { '200': { description: 'Nouveau jeton' }, '401': { description: 'Jeton invalide' } },
      },
    },
    '/auth/logout': {
      post: { summary: 'Deconnexion', tags: ['Auth'], responses: { '204': { description: 'Deconnecte' } } },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Demande de reinitialisation de mot de passe',
        tags: ['Auth'],
        responses: { '202': { description: 'Email envoye si le compte existe' } },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Reinitialise le mot de passe a partir du jeton recu par email',
        tags: ['Auth'],
        responses: { '200': { description: 'Mot de passe mis a jour' }, '400': { description: 'Jeton invalide' } },
      },
    },
    '/formulas': {
      get: {
        summary: 'Liste les formules actives',
        tags: ['Catalogue'],
        responses: { '200': { description: 'Liste des formules' } },
      },
    },
    '/formulas/{slug}': {
      get: {
        summary: 'Detail d\'une formule',
        tags: ['Catalogue'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Formule' }, '404': { description: 'Introuvable' } },
      },
    },
    '/cities': {
      get: { summary: 'Liste les villes actives', tags: ['Catalogue'], responses: { '200': { description: 'Liste des villes' } } },
    },
    '/cities/{slug}/meeting-points': {
      get: {
        summary: 'Points de RDV d\'une ville',
        tags: ['Catalogue'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Liste des points de RDV' } },
      },
    },
    '/sessions': {
      get: {
        summary: 'Sessions publiees avec places disponibles',
        tags: ['Catalogue'],
        parameters: [
          { name: 'formula', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'boite', in: 'query', schema: { type: 'string', enum: ['manuelle', 'automatique'] } },
        ],
        responses: { '200': { description: 'Liste des sessions' } },
      },
    },
    '/admin/formulas': {
      get: { summary: 'CRUD formules (admin)', tags: ['Admin'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Liste' } } },
    },
    '/admin/sessions/{id}/publish': {
      post: {
        summary: 'Publie une session (regle : examSlot avec assez de places)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Session publiee' },
          '400': { description: "Pas d'examSlot ou places insuffisantes" },
        },
      },
    },
    '/sessions/{id}/waitlist': {
      post: {
        summary: "Inscription a la liste d'attente d'une session",
        tags: ['Eleve'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Inscrit' }, '409': { description: 'Deja inscrit' } },
      },
    },
    '/instructor/sessions': {
      get: {
        summary: 'Sessions du moniteur connecte',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Liste des sessions' } },
      },
    },
    '/instructor/sessions/{id}/students': {
      get: {
        summary: "Fiche des eleves d'une session (coordonnees, formule...)",
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Liste des eleves' } },
      },
    },
    '/instructor/bookings/{bookingId}/lessons': {
      get: {
        summary: "Historique des lecons d'une reservation",
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Liste des lecons' } },
      },
      post: {
        summary: 'Saisie apres lecon (heures, competences, commentaire, presence)',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Lecon enregistree' } },
      },
    },
    '/instructor/bookings/{bookingId}/avis': {
      post: {
        summary: "Avis de fin de stage pret/pas_pret (alerte admin si pas_pret)",
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Avis enregistre' } },
      },
    },
    '/instructor/availability': {
      get: {
        summary: 'Disponibilites declarees par le moniteur',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Liste des periodes' } },
      },
      put: {
        summary: 'Remplace les disponibilites du moniteur',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Disponibilites mises a jour' } },
      },
    },
    '/instructor/hours-summary': {
      get: {
        summary: 'Recapitulatif mensuel des heures enseignees',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'month', in: 'query', required: true, schema: { type: 'string', example: '2026-01' } }],
        responses: { '200': { description: 'Total des heures' } },
      },
    },
    '/instructor/hours-summary/export.pdf': {
      get: {
        summary: 'Recapitulatif mensuel des heures en PDF',
        tags: ['Moniteur'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'month', in: 'query', required: true, schema: { type: 'string', example: '2026-01' } }],
        responses: { '200': { description: 'PDF' } },
      },
    },
    '/admin/exam-results': {
      get: { summary: "Liste des resultats d'examen", tags: ['Admin'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Liste' } } },
      post: { summary: "Saisie admis/ajourne/absent, cloture la reservation", tags: ['Admin'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Resultat enregistre' } } },
    },
    '/admin/exam-results/stats': {
      get: {
        summary: 'Statistiques de reussite par formule, ville ou moniteur',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'groupBy', in: 'query', schema: { type: 'string', enum: ['formula', 'city', 'instructor'] } }],
        responses: { '200': { description: 'Statistiques' } },
      },
    },
    '/admin/payments': {
      get: { summary: 'Liste des paiements', tags: ['Admin'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Liste' } } },
    },
    '/admin/payments/export.csv': {
      get: { summary: 'Export comptable CSV des paiements', tags: ['Admin'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Fichier CSV' } } },
    },
  },
};
