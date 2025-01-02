import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import searchStudentController from '../controllers/searchStudentController';

const router = express.Router();

router.get('/internships', verifyToken, searchStudentController.getStudents);
router.put('/internships/:id/state', verifyToken, searchStudentController.putInternshipState);
router.post('/send-mail', verifyToken, searchStudentController.sendMail);

export default router;