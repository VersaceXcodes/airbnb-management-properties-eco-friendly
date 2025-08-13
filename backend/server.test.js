import { app, pool } from './server.ts'; // Import app and database pool
import request from 'supertest';
import { userSchema, createUserInputSchema, postSchema } from './db/zodschemas'; // Import Zod schemas

// Helper functions for setting up and tearing down tests
beforeAll(async () => {
  // Prepare test database by removing existing data
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM likes');
  await pool.query('DELETE FROM posts');
  await pool.query('DELETE FROM profiles');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});

describe('User Authentication', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password_hash: 'password123',
      };

      const response = await request(app).post('/auth/register').send(newUser);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          username: newUser.username,
          email: newUser.email,
        },
      });
      expect(createUserInputSchema.safeParse(newUser).success).toBe(true);
    });

    it('should fail to register a user with existing email', async () => {
      const duplicateUser = {
        username: 'anotheruser',
        email: 'newuser@example.com',
        password_hash: 'password123',
      };

      const response = await request(app).post('/auth/register').send(duplicateUser);
      expect(response.status).toBe(400); // Assuming this is the error code for duplicate constraints
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user successfully', async () => {
      const userLogin = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/auth/login').send(userLogin);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('auth_token');
    });

    it('should fail to login with wrong password', async () => {
      const userLogin = {
        email: 'newuser@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/auth/login').send(userLogin);
      expect(response.status).toBe(401); // Unauthorized
    });
  });
});

describe('Property Management', () => {
  let authToken = '';

  beforeAll(async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'newuser@example.com',
      password: 'password123',
    });
    authToken = response.body.auth_token;
  });

  describe('GET /properties', () => {
    it('should retrieve properties successfully', async () => {
      const response = await request(app)
        .get('/properties')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /properties', () => {
    it('should create a new property listing', async () => {
      const newProperty = {
        name: 'Eco Green Home',
        description: 'A sustainable property in the heart of nature.',
        location: 'Greenland Ave',
        amenities: ['Solar Panels', 'Bamboo Furniture'],
      };

      const response = await request(app)
        .post('/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProperty);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newProperty);
    });

    it('should fail to create property without required fields', async () => {
      const incompleteProperty = {
        name: 'Incomplete Home',
      };

      const response = await request(app)
        .post('/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteProperty);
      expect(response.status).toBe(400);
    });
  });
});

describe('Database Operation Tests', () => {
  it('should insert, retrieve, update, and delete a post', async () => {
    // Insert a post
    const newPostResponse = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [1, 'A Test Post', 'Testing Database Operations']
    );
    expect(newPostResponse.rows[0]).toMatchObject({
      title: 'A Test Post',
      content: 'Testing Database Operations',
    });

    // Retrieve the post
    const retrievedPost = await pool.query('SELECT * FROM posts WHERE id = $1', [
      newPostResponse.rows[0].id,
    ]);
    expect(retrievedPost.rows[0]).toMatchObject({
      title: 'A Test Post',
    });

    // Update the post
    const updatedPost = await pool.query(
      'UPDATE posts SET title = $1 WHERE id = $2 RETURNING *',
      ['Updated Test Post', retrievedPost.rows[0].id]
    );
    expect(updatedPost.rows[0].title).toBe('Updated Test Post');

    // Delete the post
    const deleteResult = await pool.query('DELETE FROM posts WHERE id = $1', [
      retrievedPost.rows[0].id,
    ]);
    expect(deleteResult.rowCount).toBe(1);
  });
});