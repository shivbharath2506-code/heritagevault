import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'heritagevault_super_secure_jwt_secret_2026_chennai_museum';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.museum_id, m.name as museum_name, m.museum_code, m.location as museum_location
       FROM users u
       JOIN museums m ON u.museum_id = m.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      museum_id: user.museum_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN || '7d') as any });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        museum_id: user.museum_id,
        museum_name: user.museum_name,
        museum_code: user.museum_code,
        museum_location: user.museum_location,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'staff', museum_id = 1 } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }

    const validRoles = ['admin', 'curator', 'conservator', 'staff'];
    const assignedRole = validRoles.includes(role) ? role : 'staff';

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, museum_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, museum_id, created_at`,
      [name, email, passwordHash, assignedRole, museum_id]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        museum_id: newUser.museum_id,
      },
      JWT_SECRET,
      { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.museum_id, m.name as museum_name, m.museum_code, m.location as museum_location
       FROM users u
       JOIN museums m ON u.museum_id = m.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User record not found' });
      return;
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (err: any) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
