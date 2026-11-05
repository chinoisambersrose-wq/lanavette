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
  },
};
