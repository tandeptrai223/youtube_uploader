import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuid } from 'uuid';
import { runQuery, runUpdate } from '../db/init';

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = runQuery('SELECT * FROM users WHERE googleId = ?', [
          profile.id,
        ]);

        if (existingUser && existingUser.length > 0) {
          return done(null, existingUser[0]);
        }

        const userId = uuid();
        runUpdate(
          `INSERT INTO users (id, googleId, email, name, avatar, googleAccessToken, googleRefreshToken)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, profile.id, profile.emails?.[0]?.value, profile.displayName, profile.photos?.[0]?.value, accessToken, refreshToken]
        );

        const newUser = runQuery('SELECT * FROM users WHERE id = ?', [userId]);
        return done(null, newUser[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  try {
    const user = runQuery('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user?.[0]);
  } catch (error) {
    done(error);
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    res.redirect('http://localhost:3000/dashboard');
  }
);

router.get('/user', (req: Request, res: Response) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

export default router;
