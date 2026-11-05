import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from 'shared';
import { Router, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validate.js';
import { User } from '../models/User.js';
import {
  comparePassword,
  generatePasswordResetToken,
  hashPassword,
  hashPasswordResetToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../services/auth.service.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { durationToMs } from '../utils/duration.js';

export const authRouter = Router();

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: durationToMs(env.JWT_REFRESH_TTL),
  });
}

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, motDePasse, prenom, nom, telephone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'EMAIL_ALREADY_USED', 'Un compte existe deja avec cet email');
    }

    const motDePasseHash = await hashPassword(motDePasse);
    const user = await User.create({
      email,
      motDePasseHash,
      prenom,
      nom,
      telephone,
      role: 'eleve',
    });

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), role: user.role });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          prenom: user.prenom,
          nom: user.nom,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(motDePasse, user.motDePasseHash))) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
    }

    if (!user.actif) {
      throw new ApiError(403, 'ACCOUNT_DISABLED', 'Ce compte est desactive');
    }

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), role: user.role });
    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          prenom: user.prenom,
          nom: user.nom,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Jeton de rafraichissement manquant');
    }

    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    const refreshToken = signRefreshToken({ sub: payload.sub, role: payload.role });
    setRefreshCookie(res, refreshToken);

    res.json({ data: { accessToken } });
  } catch {
    next(new ApiError(401, 'UNAUTHORIZED', 'Jeton de rafraichissement invalide ou expire'));
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  res.status(204).send();
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.sub);

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'Utilisateur introuvable');
    }

    res.json({
      data: {
        id: user._id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const { token, tokenHash, expiresAt } = generatePasswordResetToken();
      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpiresAt = expiresAt;
      await user.save();

      // Lot 4 : remplacer par un envoi d'email via Brevo. En attendant, log en dev uniquement.
      logger.info({ email, token }, 'Jeton de reinitialisation de mot de passe genere');
    }

    // Toujours une reponse 202 identique, meme si l'email est inconnu (anti-enumeration).
    res.status(202).json({ data: { message: 'Si ce compte existe, un email a ete envoye' } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, motDePasse } = req.body;
    const tokenHash = hashPasswordResetToken(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

    if (!user) {
      throw new ApiError(400, 'INVALID_RESET_TOKEN', 'Jeton invalide ou expire');
    }

    user.motDePasseHash = await hashPassword(motDePasse);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ data: { message: 'Mot de passe mis a jour' } });
  } catch (err) {
    next(err);
  }
});
