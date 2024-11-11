import express from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import departmentAdminController from '../controllers/departmentAdminController';

const router = express.Router();

router.get('/department-admin/users', verifyToken, departmentAdminController.getAllUsers);
router.get('/department-admin/department-admin', verifyToken, departmentAdminController.getDepartmentAdmin);

router.post('/department-admin/create-user', verifyToken, departmentAdminController.createUser);

export default router;