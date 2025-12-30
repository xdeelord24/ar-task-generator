import express from 'express';
import cors from 'cors';
import { DatabaseHandler } from './database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbHandler = new DatabaseHandler('./database.sqlite');

// Initialize Database
(async () => {
    try {
        await dbHandler.initialize();
        console.log('Connected to SQLite database using Standard Handler.');
    } catch (error) {
        console.error('Error initializing database handler:', error);
    }
})();

// --- Auth Routes ---

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const existingUser = await dbHandler.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await dbHandler.createUser({
            id: randomUUID(),
            email,
            passwordHash,
            name,
            provider: 'local'
        });

        const token = generateToken(newUser);
        res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, avatarUrl: newUser.avatar_url } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await dbHandler.getUserByEmail(email);
        if (!user || !user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google Login (Expects ID Token)
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token, user: clientUser } = req.body; // user info from client or verify token server-side

        // In a real app, verify 'token' with Google's public keys.
        // For this demo, we accept the client's trusted info provided alongside or decode token (unsafe).
        // Let's assume client sends { email, name, picture, googleId }

        const { email, name, picture, sub: googleId } = clientUser || {};

        if (!email) return res.status(400).json({ error: 'Invalid payload' });

        let user = await dbHandler.getUserByEmail(email);

        if (!user) {
            user = await dbHandler.createUser({
                id: randomUUID(),
                email,
                name,
                provider: 'google',
                providerId: googleId,
                avatarUrl: picture
            });
        } else {
            // Update provider info if needed?
        }

        const sessionToken = generateToken(user);
        res.json({ token: sessionToken, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url || picture } });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Facebook Login
app.post('/api/auth/facebook', async (req, res) => {
    try {
        const { accessToken, userID, userInfo } = req.body;

        // Simplified: Trust client payload for demo purposes
        const { email, name, picture } = userInfo || {};

        if (!email || !name) return res.status(400).json({ error: 'Invalid payload' });

        let user = await dbHandler.getUserByEmail(email);
        if (!user) {
            user = await dbHandler.createUser({
                id: randomUUID(),
                email,
                name,
                provider: 'facebook',
                providerId: userID,
                avatarUrl: picture?.data?.url
            });
        }

        const sessionToken = generateToken(user);
        res.json({ token: sessionToken, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url } });

    } catch (error) {
        console.error('Facebook auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next(); // Proceed without user (public/legacy)

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) req.user = user;
        next();
    });
};

// Get value
app.get('/api/storage/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        let storageKey = key;

        // If authenticated, use user-scoped key
        if (req.user && req.user.id) {
            storageKey = `user:${req.user.id}:${key}`;
        }

        const data = await dbHandler.get(storageKey);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Set value
app.post('/api/storage/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        let storageKey = key;

        if (req.user && req.user.id) {
            storageKey = `user:${req.user.id}:${key}`;
        } else {
            // Optional: Block write if not authenticated
            // return res.status(401).json({ error: 'Unauthorized' });
        }

        await dbHandler.set(storageKey, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
