import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import axios from 'axios';
import Input from '../../components/Input/Input';
import '../SuperAdmin/SuperAdmin.css';
import './DepartmentAdmin.css'

const DepartmentAdminPage: React.FC = () => {
    const [adminInfo, setAdminInfo] = useState<any>(null);
    const [inputFullName, setInputFullName] = useState("");
    const [inputEmail, setInputEmail] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [activeUserPage, setActiveUserPage] = useState(1);
    const usersPerPage = 5;
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [inputPassword, setInputPassword] = useState("");
    const navigate = useNavigate();

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
        }
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    const handleError = (error: any) => {
        if (axios.isAxiosError(error) && error.response) {
            setError(error.response.data.message);
        } else {
            setError('Bilinmeyen bir hata oluştu');
        }
    };

    // Yönetici Bilgilerini Getir
    const fetchAdminInfo = async () => {
        try {
            const response = await axios.get("/api/department-admin/department-admin", {
                headers: getAuthHeader(),
            });
            setAdminInfo(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    // Departmandaki Kullanıcıları Getir
    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/department-admin/users", {
                headers: getAuthHeader(),
            });
            setUsers(response.data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Yeni Kullanıcı Ekle
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser = {
            full_name: inputFullName,
            mail: inputEmail,
            password: inputPassword,
            role: "User",
            department: adminInfo.department
        };
        try {
            const response = await axios.post("/api/department-admin/create-user", newUser, {
                headers: getAuthHeader(),
            });
            setUsers([...users, response.data]);
            setInputFullName("");
            setInputEmail("");
            setInputPassword("");
            setError(null);
        } catch (error) {
            handleError(error);
        }
    };

    // Kullanıcıyı Sil
    const handleDeleteUser = async (userId: number) => {
        try {
            await axios.delete(`/api/department-admin/delete-user/${userId}`, {
                headers: getAuthHeader(),
            });
            setUsers(users.filter(user => user.id !== userId));
            setError(null);
        } catch (error) {
            handleError(error);
        }
    };

    // Kullanıcı Sayfalandırma
    const indexOfLastUser = activeUserPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalUserPages = Math.ceil(users.length / usersPerPage);
    const handleUserPageChange = (pageNumber: number) => setActiveUserPage(pageNumber);

    useEffect(() => {
        fetchAdminInfo();
        fetchUsers();
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
            <Row className='deparment-admin-container mb-4 justify-content-center'>
                { /* Sol tarafta Kullanıcı bilgileri */ }
                <Col md={4} className="admin-info elegant-card-wrapper">
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

                                                <Form.Group className="info-group mb-3">
                                                <Form.Label className="form-label font-weight-bold">Email:</Form.Label>
                                                <span className="d-block">{adminInfo.mail}</span>
                                                </Form.Group>

                                                <Form.Group className="info-group">
                                                <Form.Label className="form-label font-weight-bold">Departman:</Form.Label>
                                                <span className="d-block">{adminInfo.department.department_name}</span>
                                                </Form.Group>
                                            </ListGroup.Item>
                                        </>
                                    ) : (
                                        <ListGroup.Item>Yönetici bilgileri yükleniyor...</ListGroup.Item>
                                    )}
                                </ListGroup>
                            </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="add-user elegant-card-wrapper">
                    <Card>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Kullanıcı Ekle
                        </Card.Header>
                        <Card.Body>
                            <Form className="form-department-admin form-wrapper" onSubmit={handleAddUser}>
                                <Form.Group controlId="fullName">
                                    <Form.Label className="form-label">İsim Soyisim</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="İsim Soyisim"
                                        value={inputFullName}
                                        onChange={(e) => setInputFullName(e.target.value)}
                                        required
                                        className='custom-input shadow-sm'
                                    />
                                </Form.Group>
                                
                                <div className="d-flex align-items-center">
                                    {/* Email Alanı */}
                                    <Form.Group className="me-2" style={{ flex: 1 }} controlId="email">
                                        <Form.Label className="form-label">Email</Form.Label>
                                        <Input 
                                            type="email"
                                            placeholder="Email"
                                            value={inputEmail}
                                            onChange={(e) => setInputEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    {/* Şifre Alanı */}
                                    <Form.Group style={{ flex: 1 }} controlId="password">
                                        <Form.Label className="form-label">Şifre</Form.Label>
                                        <Input 
                                            type="password"
                                            placeholder="Şifre"
                                            value={inputPassword}
                                            onChange={(e) => setInputPassword(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                                <Button 
                                        type="submit"
                                        className="submit-btn"
                                        >
                                        Ekle
                                </Button>
                            </Form>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
            <Row className='deparment-admin-container mb-4'>
                <Col md={8} className='admin-users'>
                    <Card className='mb-4 elegant-card shadow-sm rounded-lg'>
                        <Card.Header 
                            className="text-center text-white profile-header" 
                            style={{ 
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    backgroundColor: "#007bff",
                                    borderBottom: "3px solid #0056b3",
                                }}>
                                Kullanıcılar
                        </Card.Header>
                        <Card.Body>
                            <div className='table-responsive'>
                            <Table striped bordered hover size="sm" className='fancy-table'>
                                <thead>
                                        <tr>
                                            <th className='department-name text-center'>İsim</th>
                                            <th className='department-name text-center'>Email</th>
                                            <th className='department-name text-center'>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((user, index) => (
                                            <tr key={index}>
                                                <td className='department-name'>{user.full_name}</td>
                                                <td className='department-name'>{user.mail}</td>
                                                <td className='text-end'>
                                                    <Button
                                                        className='delete-btn'
                                                        variant="danger" 
                                                        onClick={() => handleDeleteUser(user.id)}
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
                                { /* Sol Ok */}
                                <Pagination.Prev 
                                    onClick={() => handleUserPageChange(activeUserPage - 1)}
                                    disabled={activeUserPage === 1}
                                />
                                {Array.from({ length: Math.min(3, totalUserPages) }).map((_, index) => {
                                    const startPage = Math.max(1, activeUserPage - 1); // Aktif sayfanın bir öncesi
                                    const page = startPage + index; // Gösterilecek sayfaları dinamik olarak hesapla

                                    if (page > totalUserPages) return null; // Toplam sayfa sayısından büyükse render etme

                                    return (
                                        <Pagination.Item
                                            key={page}
                                            active={page === activeUserPage} // Aktif sayfa ise stil uygula
                                            onClick={() => handleUserPageChange(page)}
                                        >
                                            {page}
                                        </Pagination.Item>
                                    );
                                })}
                                { /* Sağ Ok */}
                                <Pagination.Next 
                                    onClick={() => handleUserPageChange(activeUserPage + 1)}
                                    disabled={activeUserPage === totalUserPages}
                                />
                            </Pagination>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DepartmentAdminPage;
