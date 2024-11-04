import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import superAdminRoutes from './routes/superAdminRoutes';
import { verifyToken } from './middlewares/verifyToken'; // Token doğrulama middleware'i
import 'reflect-metadata';
import { AppDataSource } from '../ormconfig';
import { API_PORT, API_URL } from './config';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization:', err);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api', superAdminRoutes);

app.listen(API_PORT, () => {
  console.log(`Server is running at ${API_URL}:${API_PORT}`);
});
