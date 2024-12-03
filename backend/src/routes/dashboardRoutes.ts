import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import dashboardController from '../controllers/dashboardController';

const router = express.Router();

router.get('/internships', verifyToken, dashboardController.getStudents);
router.put('/internships/:id/state', verifyToken, dashboardController.putInternshipState);

export default router;