-- Create tables

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id),
    user_id INT REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id),
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the database

INSERT INTO users (username, email, password_hash) VALUES
('alice', 'alice@example.com', 'password123'),
('bob', 'bob@example.com', 'admin123'),
('charlie', 'charlie@example.com', 'user123');

INSERT INTO profiles (user_id, bio, avatar_url) VALUES
(1, 'Enthusiastic traveler and foodie.', 'https://picsum.photos/seed/1/200'),
(2, 'Software developer and musician.', 'https://picsum.photos/seed/2/200'),
(3, 'Book lover and aspiring writer.', 'https://picsum.photos/seed/3/200');

INSERT INTO posts (user_id, title, content, image_url) VALUES
(1, 'My Travel Experience', 'I recently traveled to Japan and it was amazing!', 'https://picsum.photos/seed/4/200'),
(2, 'How to Learn Guitar', 'Learning guitar is a wonderful journey.', 'https://picsum.photos/seed/5/200'),
(3, 'Best Books of 2023', 'Here are some of my favorite books of this year.', 'https://picsum.photos/seed/6/200');

INSERT INTO comments (post_id, user_id, comment) VALUES
(1, 2, 'Sounds like a fun trip!'),
(2, 3, 'I totally agree, playing guitar is awesome!'),
(3, 1, 'Great book selection!');

INSERT INTO likes (post_id, user_id) VALUES
(1, 3),
(2, 1),
(3, 2);