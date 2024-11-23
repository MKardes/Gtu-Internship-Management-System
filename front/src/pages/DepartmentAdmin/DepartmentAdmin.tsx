import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import axios from 'axios';
import Input from '../../components/Input/Input';
import '../SuperAdmin/SuperAdmin.css'

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
                    <Card className='elegant-card shadow-sm rounded-lg mb-4'>
                            <Card.Header className='elegant-card-header'>Yönetici Bilgileri</Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {adminInfo ? (
                                        <>
                                            <ListGroup.Item><strong>Ad Soyad:</strong> {adminInfo.full_name}</ListGroup.Item>
                                            <ListGroup.Item><strong>Email:</strong> {adminInfo.mail}</ListGroup.Item>
                                            <ListGroup.Item><strong>Departman:</strong> {adminInfo.department.department_name}</ListGroup.Item>
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
                        <Card.Header>Yeni Kullanıcı Ekle</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group controlId="fullName">
                                    <Form.Label>İsim Soyisim</Form.Label>
                                    <Input 
                                        type="text"
                                        placeholder="İsim Soyisim"
                                        value={inputFullName}
                                        onChange={(e) => setInputFullName(e.target.value)}
                                    />
                                </Form.Group>
                                
                                <div className="d-flex align-items-center">
                                    {/* Email Alanı */}
                                    <Form.Group className="me-2" style={{ flex: 1 }} controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Input 
                                            type="email"
                                            placeholder="Email"
                                            value={inputEmail}
                                            onChange={(e) => setInputEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    {/* Şifre Alanı */}
                                    <Form.Group style={{ flex: 1 }} controlId="password">
                                        <Form.Label>Şifre</Form.Label>
                                        <Input 
                                            type="password"
                                            placeholder="Şifre"
                                            value={inputPassword}
                                            onChange={(e) => setInputPassword(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>

                                <Button variant="primary" type="submit">Kullanıcı Ekle</Button>
                            </Form>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
            <Row className='deparment-admin-container mb-4'>
                <Col md={8} className='admin-users'>
                    <Card className='mb-4 elegant-card shadow-sm rounded-lg'>
                        <Card.Header className='elegant-card-header'>Kullanıcılar</Card.Header>
                        <Card.Body>
                            <div className='table-responsive'>
                                <Table striped bordered hover className='mb-3'>
                                    <thead>
                                        <tr>
                                            <th>İsim</th>
                                            <th>Email</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.full_name}</td>
                                                <td>{user.mail}</td>
                                                <td>
                                                    <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                                                        Sil
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <Pagination>
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
