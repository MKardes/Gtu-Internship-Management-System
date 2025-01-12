import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reportRoutes';
import refreshTokenRoutes from './routes/refreshToken';
import superAdminRoutes from './routes/superAdminRoutes';
import departmentAdminRoutes from './routes/departmentAdminRoutes';
import searchStudentRoutes from './routes/searchStudentRoutes';
import chartRoutes from './routes/chartRoutes';
import termRoutes from './routes/termRoutes';
import { verifyToken } from './middlewares/verifyToken'; // Token doğrulama middleware'i
import 'reflect-metadata';
import { AppDataSource } from '../ormconfig';
import { API_PORT, API_URL } from './config';
import { parsePdf } from './drive/pdfparse'
import cron from 'node-cron';
import { logger } from './utils/ResponseHandler';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization:', err);
  });

const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    exposedHeaders: ['Content-Disposition'], // headers that is shown in browser
}));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshTokenRoutes);
app.use('/api', superAdminRoutes);
app.use('/api', departmentAdminRoutes);
app.use('/api', searchStudentRoutes);
app.use('/api', chartRoutes);
app.use('/api', termRoutes);
app.use('/api', reportRoutes);

app.listen(API_PORT, () => {
  console.log(`Server is running at ${API_URL}:${API_PORT}`);
});

//her 30dk'da bir pdf dosyalarını parse eder
cron.schedule('*/30 * * * * *', async () => {
  logger.log("[SERVER] - Scheduled task started: Parsing PDF files...");
  try {
    await parsePdf();
    logger.log("[SERVER] - Scheduled task finished successfully.");
  } catch (error) {
    logger.log(`[SERVER] - Scheduled task had an error.`);
  }
});