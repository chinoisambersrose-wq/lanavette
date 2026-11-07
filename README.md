# NAVETTE — Plateforme d'auto-école en accéléré

Monorepo npm workspaces : `apps/api`, `apps/app`, `apps/vitrine`, `packages/shared`.
Voir `CLAUDE.md` pour les conventions et `docs/CAHIER_DES_CHARGES.md` / `docs/ROADMAP.md`
pour le périmètre fonctionnel et le plan de travail lot par lot.

## Démarrage

```bash
npm install                 # à la racine
npm run dev -w apps/api     # API sur http://localhost:4000
npm run dev -w apps/app     # App sur http://localhost:5173
npm run dev -w apps/vitrine # Vitrine sur http://localhost:4321
npm run test -w apps/api    # Tests API (Vitest + Supertest)
npm run lint                # ESLint + Prettier sur tout le monorepo
```

Chaque app a un `.env.example` à copier en `.env` avant de démarrer.

`research/` contient des données de veille concurrentielle à usage interne uniquement
(jamais à copier dans le produit — voir la section « Contenus et originalité » de `CLAUDE.md`).

## Déploiement

Voir `docs/DEPLOIEMENT.md` : vitrine et app sur Vercel, API en Docker derrière Nginx sur un VPS
(image publiée automatiquement via `.github/workflows/deploy-api.yml`), base MongoDB Atlas.
