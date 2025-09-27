import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import morgan from 'morgan';
import fs from 'fs';
import { userSchema, createUserInputSchema, profileSchema, 
         updateProfileInputSchema } from './schema.ts';
import type { ZodTypeAny } from 'zod';

// Simple Zod validation middleware
const zodValidator = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  next();
};

dotenv.config();
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;

const { Pool } = pkg;

const pool = new Pool(
  DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
      }
);

const app = express();

// ESM workaround for __dirname
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('combined'));

// Serve static files from the 'public' directory if present
const publicDir = path.join(__dirname, 'public');
const publicIndex = path.join(publicDir, 'index.html');
if (fs.existsSync(publicIndex)) {
  app.use(express.static(publicDir));
}

// Middleware
declare module 'express-serve-static-core' {
  interface Request {
    user?: { user_id: number; email: string };
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = decoded as any;
    next();
  });
};

// Routes

// Register endpoint
app.post('/auth/register', zodValidator(createUserInputSchema), async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;
   
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username.toLowerCase(), email.toLowerCase(), password_hash]
    );

    const user = result.rows[0];
    
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ auth_token: token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (user.password_hash !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ auth_token: token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User Profile
app.get('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const profile = result.rows[0];
    res.json(profile);
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update User Profile
app.put('/users/profile', authenticateToken, zodValidator(updateProfileInputSchema), async (req, res) => {
  const { bio, avatar_url } = req.body;
  const { user_id } = req.user;

  try {
    const result = await pool.query(
      'UPDATE profiles SET bio = $1, avatar_url = $2 WHERE user_id = $3 RETURNING *',
      [bio, avatar_url, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const updatedProfile = result.rows[0];
    res.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/properties', async (req, res) => {
  const { eco_rating_min, eco_rating_max, amenities, location } = req.query as Record<string, string | undefined>;

  // coerce to numbers/strings safely

  let baseQuery = 'SELECT * FROM properties WHERE true';
  const queryParams = [];

  if (eco_rating_min) {
    const min = Number(eco_rating_min);
    if (!Number.isNaN(min)) {
      queryParams.push(min);
      baseQuery += ` AND eco_rating >= $${queryParams.length}`;
    }
  }

  if (eco_rating_max) {
    const max = Number(eco_rating_max);
    if (!Number.isNaN(max)) {
      queryParams.push(max);
      baseQuery += ` AND eco_rating <= $${queryParams.length}`;
    }
  }

  if (amenities) {
    const amenitiesArray = String(amenities).split(',');
    queryParams.push(amenitiesArray);
    baseQuery += ` AND amenities @> $${queryParams.length}::text[]`;
  }

  if (location) {
    queryParams.push(`%${String(location)}%`);
    baseQuery += ` AND location ILIKE $${queryParams.length}`;
  }

  try {
    const result = await pool.query(baseQuery, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Property retrieval error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/inventory', authenticateToken, async (req, res) => {
  const { name, quantity } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO inventory (name, quantity) VALUES ($1, $2) RETURNING *',
      [name, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Inventory addition error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/feedback', async (req, res) => {
  const { property_id, user_id, feedback } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO feedback (property_id, user_id, feedback) VALUES ($1, $2, $3) RETURNING *',
      [property_id, user_id, feedback]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((req, res, next) => {
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  next();
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});

export { app, pool };