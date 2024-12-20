import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import termController from '../controllers/termController';

const router = express.Router();

router.post('/term', verifyToken, termController.createTerm);
router.get('/terms', verifyToken, termController.getTerms);
router.get('/term-internships', verifyToken, termController.getTermInternships);

export default router;