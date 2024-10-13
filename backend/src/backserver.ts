import express, { Request, Response, RequestHandler } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';


const app = express();
const PORT = 3000;

// DB CONNECTION

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// secret key for jwt ??
const SECRET_KEY = '123';


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});


// Login endpoint
const loginHandler: RequestHandler = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const query = 'SELECT * FROM "admin" WHERE email = $1';
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            res.status(401).json({ error: 'No email found' });
            return;
        }

        const user = result.rows[0];

        if (user.password !== password) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // sign jwt token
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred during login' });
    }
};

// signup endpoint
const signupHandler: RequestHandler = async (req, res): Promise<void> => {
    const { email, pass, confirmpass } = req.body;

    if (!email || !pass || !confirmpass) {
        res.status(400).json({ error: 'Email, password, and confirm password are required' });
        return;
    }

    if (pass !== confirmpass) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
    }

    try {
        const query = 'SELECT * FROM "admin" WHERE email = $1';
        const result = await db.query(query, [email]);

        if (result.rows.length !== 0) {
            res.status(400).json({ error: 'The email is already in use' });
            return;
        }

        const insertQuery = 'INSERT INTO "admin" (email, password) VALUES ($1, $2) RETURNING *';
        const insertResult = await db.query(insertQuery, [email, pass]);

        if (insertResult.rows.length === 0) {
            res.status(500).json({ error: 'An error occurred while adding the user' });
            return;
        }

        res.status(201).json({ message: 'Sign up successful' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
};

app.post('/login', loginHandler);
app.post('/signup', signupHandler);

// start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
