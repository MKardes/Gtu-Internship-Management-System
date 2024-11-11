    // src/routes/superAdminRoutes.ts
    import express from 'express';
    import superAdminController from '../controllers/superAdminController';
    import {verifyToken} from '../middlewares/verifyToken';

    const router = express.Router();

    /*          POST 
        -CREATE-DEPARTMENT-ADMIN
        -CREATE-DEPARTMENT
    */
    router.post('/super-admin/create-department-admin', verifyToken, superAdminController.createDepartmentAdmin);
    router.post('/super-admin/create-department', verifyToken, superAdminController.createDepartment);

    /*          DELETE
        -DELETE-DEPARTMENT-ADMIN
        -DELETE-DEPARTMENT
    */
    router.delete('/super-admin/delete-department-admin/:id', verifyToken, superAdminController.deleteDepartmentAdmin);
    router.delete('/super-admin/delete-department/:id', verifyToken, superAdminController.deleteDepartment);

    /*          GET
        -GET-DEPARTMENT-ADMIN
        -GET-DEPARTMENT
    */
    router.get('/super-admin/department-admins', verifyToken, superAdminController.getAllDepartmentAdmins);
    router.get('/super-admin/departments', verifyToken, superAdminController.getAllDepartments);
    router.get('/super-admin/department/:id', verifyToken, superAdminController.getDepartment);
    router.get('/super-admin/super-admin', verifyToken, superAdminController.getSuperAdmin);

    export default router;
