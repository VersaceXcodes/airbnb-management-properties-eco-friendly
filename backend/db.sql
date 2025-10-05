-- Create tables

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id),
    user_id INT REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id),
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    eco_rating DECIMAL(3,2) DEFAULT 0,
    amenities TEXT[] DEFAULT '{}',
    description TEXT,
    price_per_night DECIMAL(10,2),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id),
    user_id INT REFERENCES users(id),
    feedback TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the database

INSERT INTO users (username, email, password_hash) VALUES
('alice', 'alice@example.com', '$2a$10$Se0o/5lkr4J9pqwrWRqPi.5BCPVzNGw7CxRbMC8X3fkjL0hPFBRgm'),
('bob', 'bob@example.com', '$2a$10$49Fptd.ZtaM6GaIgXSigF.1jlBkS8yjvBiqd34uYnPFcRySbI/mRS'),
('charlie', 'charlie@example.com', '$2a$10$tGBJCVo4dKMNImRGWwavyuvg2J5LyGnvbZn6U3jzlwJ3vDOyiY0cK'),
('testuser', 'test@ecohost.com', '$2a$10$RpmFs8Yl8c1/h4DGNzekXerVXKBT8RPap3LpEwYvK6dk/7tElW1oC')
ON CONFLICT (username) DO NOTHING;

INSERT INTO profiles (user_id, bio, avatar_url) VALUES
(1, 'Enthusiastic traveler and foodie.', 'https://picsum.photos/seed/1/200'),
(2, 'Software developer and musician.', 'https://picsum.photos/seed/2/200'),
(3, 'Book lover and aspiring writer.', 'https://picsum.photos/seed/3/200'),
(4, 'Test user for EcoHost platform', 'https://picsum.photos/seed/4/200')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO posts (user_id, title, content, image_url) VALUES
(1, 'My Travel Experience', 'I recently traveled to Japan and it was amazing!', 'https://picsum.photos/seed/5/200'),
(2, 'How to Learn Guitar', 'Learning guitar is a wonderful journey.', 'https://picsum.photos/seed/6/200'),
(3, 'Best Books of 2023', 'Here are some of my favorite books of this year.', 'https://picsum.photos/seed/7/200');

INSERT INTO comments (post_id, user_id, comment) VALUES
(1, 2, 'Sounds like a fun trip!'),
(2, 3, 'I totally agree, playing guitar is awesome!'),
(3, 1, 'Great book selection!');

INSERT INTO likes (post_id, user_id) VALUES
(1, 3),
(2, 1),
(3, 2);

INSERT INTO properties (user_id, name, location, eco_rating, amenities, description, price_per_night, image_url) VALUES
(1, 'Eco Villa Paradise', 'Bali, Indonesia', 4.8, ARRAY['solar panels', 'rainwater harvesting', 'organic garden'], 'Beautiful eco-friendly villa with stunning ocean views', 150.00, 'https://picsum.photos/seed/prop1/400'),
(2, 'Green Mountain Retreat', 'Colorado, USA', 4.5, ARRAY['wind energy', 'composting', 'electric vehicle charging'], 'Sustainable mountain cabin perfect for nature lovers', 120.00, 'https://picsum.photos/seed/prop2/400'),
(1, 'Solar Powered Beach House', 'Costa Rica', 4.9, ARRAY['solar panels', 'recycling center', 'bike rental'], 'Modern beach house with 100% renewable energy', 180.00, 'https://picsum.photos/seed/prop3/400');

INSERT INTO inventory (name, quantity) VALUES
('Organic Toiletries', 50),
('Reusable Water Bottles', 30),
('Eco-Friendly Cleaning Supplies', 25),
('Solar Lanterns', 15);

INSERT INTO feedback (property_id, user_id, feedback, rating) VALUES
(1, 2, 'Amazing eco-friendly property! Loved the solar panels and organic garden.', 5),
(2, 3, 'Great sustainable features and beautiful location.', 4),
(1, 3, 'Perfect vacation spot with excellent green initiatives.', 5);