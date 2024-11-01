// src/routes/superAdminRoutes.ts
import express from 'express';
import superAdminController from '../controllers/superAdminController';

const router = express.Router();


/*          POST 
    -CREATE-DEPARTMENT-ADMIN
    -CREATE-DEPARTMENT
*/
router.post('/super-admin/create-department-admin', superAdminController.createUser);
router.post('/super-admin/create-department', superAdminController.createDepartment);

/*          DELETE
    -DELETE-DEPARTMENT-ADMIN
    -DELETE-DEPARTMENT
*/
router.delete('/super-admin/delete-department-admin/:id', superAdminController.deleteUser);
router.delete('/super-admin/delete-department/:id', superAdminController.deleteDepartment);


/*          GET
    -GET-DEPARTMENT-ADMIN
    -GET-DEPARTMENT
*/
router.get('/super-admin/department-admins', superAdminController.getAllUsers);
//router.get('/super-admin/department-admins/:id', superAdminController.);
router.get('/super-admin/departments', superAdminController.getAllDepartments);
router.get('/super-admin/department/:id', superAdminController.getDepartment);



export default router;
