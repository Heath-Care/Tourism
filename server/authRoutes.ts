import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import {
  getUserByEmail,
  createUser,
  createSession,
  getUserBySessionToken,
  deleteSession,
  toggleFavorite,
  upsertItinerary,
  deleteItinerary,
  updateUser,
  updateUserPassword,
  toPublicUser,
  seedDemoAccount,
} from './db';

seedDemoAccount();

export interface AuthedRequest extends Request {
  userId?: string;
}

function getTokenFromRequest(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice('Bearer '.length).trim();
  return null;
}

/** Attaches req.userId if a valid session token is present; does not reject the request. */
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (token) {
    const user = getUserBySessionToken(token);
    if (user) req.userId = user.id;
  }
  next();
}

/** Rejects the request with 401 if there's no valid session. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  const user = token ? getUserBySessionToken(token) : undefined;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated. Please log in again.' });
  }
  req.userId = user.id;
  next();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authRouter = Router();

authRouter.post('/signup', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body || {};
  const trimmedName = (name || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!trimmedName) return res.status(400).json({ error: 'Full name is required.' });
  if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!trimmedPassword || trimmedPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  if (confirmPassword !== undefined && String(confirmPassword).trim() !== trimmedPassword) {
    return res.status(400).json({ error: 'Passwords do not match. Please re-enter your password.' });
  }

  if (getUserByEmail(trimmedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  const passwordHash = bcrypt.hashSync(trimmedPassword, 10);
  const user = createUser({
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedEmail)}`,
    role: 'Conscious Explorer',
  });
  toggleFavorite(user.id, 'bundi');

  const token = createSession(user.id);
  res.json({ success: true, token, user: toPublicUser(user) });
});

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail) return res.status(400).json({ error: 'Please enter your email address.' });

  const user = getUserByEmail(trimmedEmail);
  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please create an account first.', notFound: true });
  }

  if (password !== undefined) {
    const trimmedPassword = String(password).trim();
    if (!trimmedPassword) return res.status(400).json({ error: 'Please enter your password.' });
    const ok = bcrypt.compareSync(trimmedPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Incorrect password. Please verify your credentials or reset your password.' });
    }
  }

  const token = createSession(user.id);
  res.json({ success: true, token, user: toPublicUser(user) });
});

authRouter.post('/logout', requireAuth, (req: AuthedRequest, res: Response) => {
  const token = getTokenFromRequest(req);
  if (token) deleteSession(token);
  res.json({ success: true });
});

authRouter.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  const user = getUserBySessionToken(getTokenFromRequest(req)!)!;
  res.json({ user: toPublicUser(user) });
});

authRouter.patch('/profile', requireAuth, (req: AuthedRequest, res: Response) => {
  const { name, avatar, role } = req.body || {};
  const updated = updateUser(req.userId!, {
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
    ...(role !== undefined ? { role } : {}),
  });
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: toPublicUser(updated) });
});

authRouter.post('/password-reset', (req: Request, res: Response) => {
  const { email, newPassword } = req.body || {};
  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail) return res.status(400).json({ error: 'Email is required.' });

  const user = getUserByEmail(trimmedEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address. Please verify your email or sign up.' });
  }

  if (newPassword && String(newPassword).trim().length >= 6) {
    updateUserPassword(user.id, bcrypt.hashSync(String(newPassword).trim(), 10));
    return res.json({ success: true, message: 'Password successfully updated! You can now log in with your new password.' });
  }

  res.json({ success: true, message: `Password reset instructions sent to ${trimmedEmail}.` });
});

authRouter.post('/favorites/:destinationId', requireAuth, (req: AuthedRequest, res: Response) => {
  const favorites = toggleFavorite(req.userId!, req.params.destinationId);
  res.json({ favoriteDestinationIds: favorites });
});

authRouter.post('/itineraries', requireAuth, (req: AuthedRequest, res: Response) => {
  const itinerary = req.body;
  if (!itinerary || !itinerary.id) return res.status(400).json({ error: 'A valid itinerary payload is required.' });
  const savedItineraries = upsertItinerary(req.userId!, itinerary);
  res.json({ savedItineraries });
});

authRouter.delete('/itineraries/:itineraryId', requireAuth, (req: AuthedRequest, res: Response) => {
  const savedItineraries = deleteItinerary(req.userId!, req.params.itineraryId);
  res.json({ savedItineraries });
});
