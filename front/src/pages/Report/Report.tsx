import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Report.css"; // Importing custom CSS file for styling

const Report: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedComissionVise, setSelectedComissionVise] = useState("");
    const [selectedComission, setSelectedComission] = useState("");
    const [selectedComission_2, setSelectedComission_2] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();

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
        console.error(error);
        if (error.response && error.response.status === 401) {
            navigate("/login");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const createReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const findUserFullName = (userId: string) => {
            const user = users.find((u) => u.id === userId);
            return user ? user.full_name : "";
        };
    
        const reportData = {
            day: selectedDay,
            month: selectedMonth,
            year: selectedYear,
            comissionVise: findUserFullName(selectedComissionVise),
            comissionMember1: findUserFullName(selectedComission),
            comissionMember2: findUserFullName(selectedComission_2),
        };

        try {
            setLoading(true);
            const response = await axios.post("api/report/create-report", reportData, {
                headers: getAuthHeader(),
            });
            alert("Rapor başarıyla oluşturuldu!");
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="report-container">
            <h1 className="text-center mb-4">Rapor Oluştur</h1>
            <Form onSubmit={createReport}>
                <Row>
                    {/* Day Input */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Gün</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                            >
                                <option value="">Gün</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    {/* Month Input */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Ay</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">Ay</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    {/* Year Input */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Yıl</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="">Yıl</option>
                                {Array.from({ length: 5 }, (_, i) => i + currentYear - 5).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                                {Array.from({ length: 5 }, (_, i) => i + currentYear).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    {/* Comission Vise */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Komisyon Başkanı</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedComissionVise}
                                onChange={(e) => setSelectedComissionVise(e.target.value)}
                            >
                                <option value="">Komisyon Başkanı</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    {/* Comission Member 1 */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Komisyon Üyesi 1</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedComission}
                                onChange={(e) => setSelectedComission(e.target.value)}
                            >
                                <option value="">Komisyon Üyesi 1</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    {/* Comission Member 2 */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Komisyon Üyesi 2</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedComission_2}
                                onChange={(e) => setSelectedComission_2(e.target.value)}
                            >
                                <option value="">Komisyon Üyesi 2</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "Oluşturuluyor..." : "Rapor Oluştur"}
                </Button>
            </Form>
        </Container>
    );
};

export default Report;
