import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './SuperAdmin.css';

const SuperAdminPage: React.FC = () => {

    const [adminInfo, setAdminInfo] = useState<any>(null);
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [inputDepartment, setInputDepartment] = useState("");
    const [admins, setAdmins] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [activeAdminPage, setActiveAdminPage] = useState(1);
    const adminsPerPage = 5;
    const [inputDepartmentName, setInputDepartmentName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [activeDepartmentPage, setActiveDepartmentPage] = useState(1);
    const departmentsPerPage = 5;
    const navigate = useNavigate();

    // Fetch Super Admin Info
    const fetchSuperAdmin = async () => {
        try {
            const response = await axios.get("/api/super-admin/super-admin", {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setAdminInfo(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    // Fetch Admins
    const fetchAdmins = async () => {
        try {
            const response = await axios.get('/api/super-admin/department-admins', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setAdmins(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    // Fetch Departments
    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/super-admin/departments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setDepartments(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    // Create New Department Admin
    const handleCreateDepartmentAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const newAdmin = {
            full_name: inputUsername,
            mail: inputEmail,
            password: inputPassword,
            role: "DepartmentAdmin",
            department_id: inputDepartment,
        };
        try {
            const response = await axios.post('/api/super-admin/create-department-admin', newAdmin, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setAdmins([...admins, response.data]);
            setInputUsername("");
            setInputPassword("");
            setInputEmail("");
            setInputDepartment("");
        } catch (error) {
            handleError(error);
        }
    };

    // Create New Department
    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newDepartment = { department_name: inputDepartmentName };
            const response = await axios.post('/api/super-admin/create-department', newDepartment, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setDepartments([...departments, response.data]);
            setInputDepartmentName("");
        } catch (error) {
            handleError(error);
        }
    };

    // Delete Department Admin
    const handleDeleteDepartmentAdmin = async (adminId: number) => {
        try {
            await axios.delete(`/api/super-admin/delete-department-admin/${adminId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setAdmins(admins.filter(admin => admin.id !== adminId));
        } catch (error) {
            handleError(error);
        }
    };

    // Delete Department
    const handleDeleteDepartment = async (departmentId: number) => {
        try {
            await axios.delete(`/api/super-admin/delete-department/${departmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            });
            setDepartments(departments.filter(department => department.id !== departmentId));
            setAdmins(admins.filter(admin => admin.department.id !== departmentId));
        } catch (error) {
            handleError(error);
        }
    };

    // Admin Pagination
    const indexOfLastAdmin = activeAdminPage * adminsPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
    const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
    const totalAdminPages = Math.ceil(admins.length / adminsPerPage);
    const handleAdminPageChange = (pageNumber: number) => {
        setActiveAdminPage(pageNumber);
    };

    // Department Pagination
    const indexOfLastDepartment = activeDepartmentPage * departmentsPerPage;
    const indexOfFirstDepartment = indexOfLastDepartment - departmentsPerPage;
    const currentDepartments = departments.slice(indexOfFirstDepartment, indexOfLastDepartment);
    const totalDepartmentPages = Math.ceil(departments.length / departmentsPerPage);
    const handleDepartmentPageChange = (pageNumber: number) => {
        setActiveDepartmentPage(pageNumber);
    };

    const handleError = (error: any) => {
        if (axios.isAxiosError(error) && error.response) {
            setError(error.response.data.message);
        } else {
            setError('Bilinmeyen bir hata oluştu');
        }
    };

    useEffect(() => {
        fetchSuperAdmin();
        fetchAdmins();
        fetchDepartments();
    }, []);


    return (
        <Container fluid className="super_admin_container mt-4">
            <Row>
                <Col md={4}>
                    <Card>
                    <Card.Body>
                            <Card.Title>Yönetici Bilgileri</Card.Title>
                            {adminInfo ? (
                                <>
                                    <p><strong>Ad Soyad:</strong> {adminInfo.full_name}</p>
                                    <p><strong>Email:</strong> {adminInfo.mail}</p>
                                </>
                            ) : (
                                <p>Yönetici bilgileri yükleniyor...</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mt-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Yeni Departman Ekle</Card.Title>
                            <Form onSubmit={handleCreateDepartment}>
                                <Form.Group className="mb-3" controlId="departmentName">
                                    <Form.Label>Departman İsmi</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Departman ismi girin"
                                        value={inputDepartmentName}
                                        onChange={(e) => setInputDepartmentName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Ekle
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Yeni Yönetici Ekle</Card.Title>
                            <Form onSubmit={handleCreateDepartmentAdmin}>
                                <Form.Group className="mb-2" controlId="name">
                                    <Form.Label>İsim Soyisim</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="İsim"
                                        value={inputUsername}
                                        onChange={(e) => setInputUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email"
                                        value={inputEmail}
                                        onChange={(e) => setInputEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2" controlId="password">
                                    <Form.Label>Şifre</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Şifre"
                                        value={inputPassword}
                                        onChange={(e) => setInputPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2" controlId="department">
                                    <Form.Label>Departman</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={inputDepartment}
                                        onChange={(e) => setInputDepartment(e.target.value)}
                                        required
                                    >
                                        <option value="">Departman Seçin</option>
                                        {departments.map((dept, index) => (
                                            <option key={index} value={dept.id}>{dept.department_name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Button variant="success" type="submit">Ekle</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={4}>
                    <Card className='department_card'>
                    <Card.Body className='department_card_body'>
                            <Card.Title>Departmanlar</Card.Title>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Departman İsmi</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDepartments.map((department, index) => (
                                        <tr key={index}>
                                            <td>{department.department_name}</td>
                                            <td>
                                                <Button variant="danger" onClick={() => handleDeleteDepartment(department.id)}>Sil</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Pagination className='super_admin_pagination'>
                                {[...Array(totalDepartmentPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index}
                                        active={index + 1 === activeDepartmentPage}
                                        onClick={() => handleDepartmentPageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className='department_card'>
                        <Card.Body className='department_card_body'>
                            <Card.Title>Departman Yöneticileri</Card.Title>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>İsim Soyisim</th>
                                        <th>Email</th>
                                        <th>Departman</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAdmins.map((admin, index) => (
                                        <tr key={index}>
                                            <td>{admin.full_name}</td>
                                            <td>{admin.mail}</td>
                                            <td>{admin.department ? admin.department.department_name : ''}</td>
                                            <td>
                                                <Button variant="danger" onClick={() => handleDeleteDepartmentAdmin(admin.id)}>Sil</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Pagination>
                                {[...Array(totalAdminPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index}
                                        active={index + 1 === activeAdminPage}
                                        onClick={() => handleAdminPageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </Container>
    );
};

export default SuperAdminPage;
