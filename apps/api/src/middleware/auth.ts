import type { NextFunction, Request, Response } from 'express';
import type { Role } from 'shared';
import { ApiError } from './errorHandler.js';
import { verifyAccessToken, type AccessTokenPayload } from '../services/auth.service.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'UNAUTHORIZED', "Jeton d'acces manquant"));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new ApiError(401, 'UNAUTHORIZED', "Jeton d'acces invalide ou expire"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'UNAUTHORIZED', 'Authentification requise'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, 'FORBIDDEN', 'Acces refuse pour ce role'));
      return;
    }

    next();
  };
}
