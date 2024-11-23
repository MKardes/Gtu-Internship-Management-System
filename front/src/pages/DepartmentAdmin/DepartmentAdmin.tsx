import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        <Container className="mt-4">
            <Row>
                <Col md={4}>
                    <Card>
                        <Card.Header>Yönetici Bilgileri</Card.Header>
                        <Card.Body>
                            {adminInfo ? (
                                <>
                                    <p><strong>İsim:</strong> {adminInfo.full_name}</p>
                                    <p><strong>Email:</strong> {adminInfo.mail}</p>
                                    { /* <p><strong>Departman:</strong> {adminInfo.department.department_name}</p> */}
                                </>
                            ) : (
                                <p>Yönetici bilgileri yükleniyor...</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card>
                        <Card.Header>Yeni Kullanıcı Ekle</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-2" controlId="fullName">
                                    <Form.Label>İsim Soyisim</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="İsim soyisim girin"
                                        value={inputFullName}
                                        onChange={(e) => setInputFullName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email girin"
                                        value={inputEmail}
                                        onChange={(e) => setInputEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2" controlId="password">
                                    <Form.Label>Şifre</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Şifre girin"
                                        value={inputPassword}
                                        onChange={(e) => setInputPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">Kullanıcı Ekle</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8} className="mt-4">
                    <Card>
                        <Card.Header>Kullanıcılar</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
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
                            <Pagination>
                                {[...Array(totalUserPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index}
                                        active={index + 1 === activeUserPage}
                                        onClick={() => handleUserPageChange(index + 1)}
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

export default DepartmentAdminPage;
