// src/app.ts
import express from 'express';
import 'reflect-metadata';
import { AppDataSource } from '../ormconfig';
import superAdminRoutes from './routes/superAdminRoutes';
import cors from 'cors';

const app = express();
const hostname = '0.0.0.0';
const port = 5000;

const corsOptions = {
    origin: 'http://localhost:3000', // Front-end uygulamanızın URL'si
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Middleware
app.use(express.json()); // JSON isteklerini işlemek için
app.use(cors()); // CORS hatalarını önlemek için

// Veritabanı bağlantısını başlat
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err: any) => {
        console.error('Error during Data Source initialization:', err);
    });



// Rotaları ekleyin
app.use('/api', superAdminRoutes); // API rotaları için ön ek

// Ana sayfa isteği
app.get('/', (req, res) => {
    res.status(200).send('Hello, TypeScript!');
});

// Sunucuyu başlat
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
