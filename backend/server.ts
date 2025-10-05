import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import { userSchema, createUserInputSchema, profileSchema, 
         updateProfileInputSchema, registerInputSchema, loginInputSchema } from './schema.ts';
import { zodValidator } from './middlewares/validation.ts';

interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
  };
}

dotenv.config();
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key', USE_PGLITE } = process.env;

const { Pool } = pkg;

let pool: any;
const usePGlite = USE_PGLITE === 'true' || (PGHOST === 'localhost' && !DATABASE_URL);

if (usePGlite) {
  const { PGlitePool } = await import('./pglite-setup.ts');
  pool = new PGlitePool();
  console.log('Using PGlite for database');
} else {
  pool = new Pool(
    DATABASE_URL
      ? {
          connectionString: DATABASE_URL,
          ssl: { rejectUnauthorized: false }
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
  console.log('Using PostgreSQL for database');
}

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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user as { user_id: number; email: string };
    next();
  });
};

// Routes

// Register endpoint
app.post('/auth/register', zodValidator(registerInputSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
   
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [name.toLowerCase(), email.toLowerCase(), hashedPassword]
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
app.post('/auth/login', zodValidator(loginInputSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
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

// Verify token endpoint
app.get('/auth/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.user!;
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/users/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.user!;
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

app.put('/users/profile', authenticateToken, zodValidator(updateProfileInputSchema), async (req: AuthRequest, res: Response) => {
  const { bio, avatar_url } = req.body;
  const { user_id } = req.user!;

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

app.get('/properties', async (req: Request, res: Response) => {
  const { eco_rating_min, eco_rating_max, amenities, location } = req.query;

  let baseQuery = 'SELECT * FROM properties WHERE true';
  const queryParams: any[] = [];

  if (eco_rating_min) {
    queryParams.push(Number(eco_rating_min));
    baseQuery += ` AND eco_rating >= $${queryParams.length}`;
  }

  if (eco_rating_max) {
    queryParams.push(Number(eco_rating_max));
    baseQuery += ` AND eco_rating <= $${queryParams.length}`;
  }

  if (amenities && typeof amenities === 'string') {
    const amenitiesArray = amenities.split(',');
    queryParams.push(amenitiesArray);
    baseQuery += ` AND amenities @> $${queryParams.length}::text[]`;
  }

  if (location && typeof location === 'string') {
    queryParams.push(`%${location}%`);
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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});

export { app, pool };