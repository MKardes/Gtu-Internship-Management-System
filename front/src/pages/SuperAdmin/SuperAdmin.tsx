import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import axios from 'axios';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

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
    const adminsPerPage = 3;
    const [inputDepartmentName, setInputDepartmentName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [activeDepartmentPage, setActiveDepartmentPage] = useState(1);
    const departmentsPerPage = 3;
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
            setError(null);
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
            setError(null);
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
            setError(null);
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
            setError(null);
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
        <Container fluid>
            <Row className="justify-content-center" style={{ position: 'relative' }}>
                {error && <ErrorAlert 
                            show={true} 
                            onClose={() => setError(null)}
                            message={error}
                        />}
            </Row>
            <Row className='super-admin-container mb-4'>

                { /* Sol tarafta Kullanıcı bilgileri */ }
                <Col md={4} className='admin-info'>
                    <Card className='mb-4 elegant-card shadow-sm rounded-lg border-primary profile-card'>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Yönetici Bilgileri
                        </Card.Header>
                        <Card.Body className='profile-body'
                            style={{
                                backgroundColor: "#f8f9fa",
                                padding: "20px",
                              }}
                        >
                            <ListGroup variant="flush">
                                {adminInfo ? (
                                    <>
                                        <ListGroup.Item className="profile-info">
                                            <Form.Group className="info-group mb-3">
                                            <Form.Label className="form-label font-weight-bold">İsim Soyisim:</Form.Label>
                                            <span className="d-block">{adminInfo.full_name}</span>
                                            </Form.Group>

                                            <Form.Group className="info-group">
                                            <Form.Label className="form-label font-weight-bold">Email:</Form.Label>
                                            <span className="d-block">{adminInfo.mail}</span>
                                            </Form.Group>
                                        </ListGroup.Item>
                                    </>
                                ) : (
                                    <ListGroup.Item>Yönetici bilgileri yükleniyor...</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    { /* Yeni Departman Ekleme Formu */ }
                    <Card className='mb-4 elegant-card shadow-sm rounded-lg border-primary'>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Yeni Departman Ekle
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateDepartment} className="form-wrapper">
                                {/* Departman İsmi Girişi */}
                                <Form.Group className="mb-3" controlId="departmentName">
                                    <Form.Control
                                        className="custom-input shadow-sm"
                                        type="text"
                                        placeholder="Departman İsmi"
                                        value={inputDepartmentName}
                                        onChange={(e) => setInputDepartmentName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button 
                                    type="submit"
                                    className="submit-btn"
                                >
                                    Ekle
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    {/*Departmanı listele*/}
                    <Card className='elegant-card shadow-sm rounded-lg mb-4'>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Departmanlar
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover size="sm" className='fancy-table'>
                                    <thead>
                                        <tr>
                                            <th className='department-name text-center'>Departman İsmi</th>
                                            <th className='department-name text-center'>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentDepartments.map((department, index) => (
                                            <tr key={index}>
                                                <td className='department-name'>
                                                    {department.department_name}
                                                </td>
                                                <td className='text-end'>
                                                    <Button
                                                        className='delete-btn'
                                                        variant="danger" 
                                                        onClick={() => handleDeleteDepartment(department.id)}
                                                    >
                                                        Sil
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            </Table>
                           
                            <Pagination className="super_admin_pagination fancy-pagination justify-content-center mt-4">
                                {/* Sol Ok */}
                                <Pagination.Prev
                                    onClick={() => handleDepartmentPageChange(activeDepartmentPage - 1)}
                                    disabled={activeDepartmentPage === 1}
                                />

                                {Array.from({ length: Math.min(3, totalDepartmentPages) }).map((_, index) => {
                                    const startPage = Math.max(1, activeDepartmentPage - 1); // Aktif sayfanın bir öncesi
                                    const page = startPage + index; // Gösterilecek sayfaları dinamik olarak hesapla

                                    if (page > totalDepartmentPages) return null; // Toplam sayfa sayısından büyükse render etme

                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === activeDepartmentPage} // Aktif sayfa ise stil uygula
                                            onClick={() => handleDepartmentPageChange(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
                                })}

                                {/* Sağ Ok */}
                                <Pagination.Next
                                    onClick={() => handleDepartmentPageChange(activeDepartmentPage + 1)}
                                    disabled={activeDepartmentPage === totalDepartmentPages}
                                />
                            </Pagination>


                        </Card.Body>
                    </Card>
                </Col>
                { /* Sağ tarafta yeni yönetici ekleme formu */ }
                <Col md={8} className='admin-management mb-4 mt-md-0'>
                    <Card className='elegant-card shadow-sm rounded-lg'>
                            <Card.Header 
                                className="text-center text-white profile-header" 
                                style={{ 
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                        backgroundColor: "#007bff",
                                        borderBottom: "3px solid #0056b3",
                                    }}>
                                    Yeni Yönetici Ekle
                            </Card.Header>
                            <Card.Body>
                                <Form className="form-super-admin" onSubmit={handleCreateDepartmentAdmin}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2" controlId="name">
                                                <Form.Label className="form-label">İsim Soyisim</Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='İsim Soyisim'
                                                    value={inputUsername}
                                                    onChange={(e) => setInputUsername(e.target.value)}
                                                    required
                                                    className='custom-input shadow-sm'
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2" controlId="email">
                                                <Form.Label className="form-label">Email</Form.Label>
                                                <Form.Control
                                                    type='email'
                                                    placeholder='Email'
                                                    value={inputEmail}
                                                    onChange={(e) => setInputEmail(e.target.value)}
                                                    required
                                                    className='custom-input shadow-sm'
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2" controlId="password">
                                                <Form.Label className="form-label">Şifre</Form.Label>
                                                <Form.Control
                                                    required
                                                    className='custom-input shadow-sm'
                                                    type='password'
                                                    placeholder='Şifre'
                                                    value={inputPassword}
                                                    onChange={(e) => setInputPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-2" controlId="department">
                                                <Form.Label className="form-label">Departman</Form.Label>
                                                <Form.Select
                                                    value={inputDepartment}
                                                    onChange={(e) => setInputDepartment(e.target.value)}
                                                    required
                                                    className='custom-input justify-content-center align-items-center shadow-sm'
                                                >
                                                    <option value="">Departman Seçin</option>
                                                    {departments.map((dept, index) => (
                                                        <option key={index} value={dept.id}>{dept.department_name}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Button 
                                        type="submit"
                                        className="submit-btn"
                                        >
                                        Ekle
                                    </Button>
                                </Form>
                            </Card.Body>
                    </Card>
                    {/*Yöneticileri listele*/}
                    <Card className='elegant-card shadow-sm rounded-lg mt-4'>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Departman Yöneticileri
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover size="sm" className='fancy-table'>
                                    <thead>
                                        <tr>
                                            <th className='department-name text-center'>İsim</th>
                                            <th className='department-name text-center'>Email</th>
                                            <th className='department-name text-center'>Departman</th>
                                            <th className='department-name text-center'>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAdmins.map((admin, index) => (
                                            <tr key={index}>
                                                <td className='department-name'>{admin.full_name}</td>
                                                <td className='department-name'>{admin.mail}</td>
                                                <td className='department-name'>{admin.department ? admin.department.department_name : ''}</td>
                                                <td className='text-end'>
                                                    <Button
                                                        className='delete-btn'
                                                        variant="danger" 
                                                        onClick={() => handleDeleteDepartmentAdmin(admin.id)}
                                                    >
                                                        Sil
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <Pagination className="super_admin_pagination fancy-pagination justify-content-center mt-4">
                                {/* Sol Ok */}
                                <Pagination.Prev
                                    onClick={() => handleAdminPageChange(activeAdminPage - 1)}
                                    disabled={activeAdminPage === 1}
                                />

                                {/* Sayfa Numaraları */}
                                {Array.from({ length: Math.min(5, totalAdminPages) }).map((_, index) => {
                                    // Sayfa hesaplaması
                                    const startPage = Math.max(1, activeAdminPage - 2); // Aktif sayfanın 2 öncesinden başla
                                    const page = startPage + index;

                                    if (page > totalAdminPages) return null; // Toplam sayfa sayısını aşarsa gösterme

                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === activeAdminPage} // Aktif sayfa için renklendirme
                                            onClick={() => handleAdminPageChange(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
                                })}

                                {/* Sağ Ok */}
                                <Pagination.Next
                                    onClick={() => handleAdminPageChange(activeAdminPage + 1)}
                                    disabled={activeAdminPage === totalAdminPages}
                                />
                            </Pagination>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SuperAdminPage;
