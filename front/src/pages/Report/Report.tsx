import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Report.css"; // Importing custom CSS file for styling
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

const Report: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedComissionVise, setSelectedComissionVise] = useState("");
    const [allTerms, setAllTerms] = useState<any[]>([]);
    const [selectedTerm, setTerm] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedComission, setSelectedComission] = useState("");
    const [selectedComission_2, setSelectedComission_2] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();


    const semesterEnum: Record<number, string> = {
        1: "Dönem içi 'Güz'",
        2: "Ara Dönem",
        3: "Dönem içi 'Bahar'",
        4: "Yaz Dönemi",
    }

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
        }
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    const handleError = async (error: any) => {
        if (error.response) {
            if (error.response.data instanceof Blob) {
                // Handle Blob response (in case the server returns binary data)
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    setError(json.message || "Bir şeyler yanlış gitti.");
                } catch (e) {
                    setError("Bir şeyler yanlış gitti.");
                }
            } else {
                setError(error.response.data.message || "Bir şeyler yanlış gitti.");
            }
        } else {
            setError("Bir şeyler yanlış gitti.");
        }
    };
    

    useEffect(() => {
        fetchUsers();
        fetchTerms();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/department-admin/all-users", {
                headers: {
                    ...getAuthHeader(),
                },
            });
            // İsme göre sıralama
            response.data.sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));
            setUsers(response.data);

        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTerms = async () => {
        try {
            const response = await axios.get("/api/terms", {
                headers: getAuthHeader(),
            });
            setAllTerms(response.data.sort((a: any, b: any) => b.name.localeCompare(a.name)));
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
            semester: semesterEnum[parseInt(selectedSemester)],
            term: allTerms.find(term => term.id == selectedTerm)?.name,
        };

        try {
            setLoading(true);
            const response = await axios.post("api/report/create-report", reportData, {
                headers: {
                    ...getAuthHeader(),
                },
                responseType: 'blob', // Blob olarak yanıt almak için
            });
            setError(null);
            setSelectedDay("");
            setSelectedMonth("");
            setSelectedYear("");
            setSelectedComissionVise("");
            setSelectedComission("");
            setSelectedComission_2("");
            setSelectedSemester("");
            setTerm("");

            const contentDisposition = response.headers['content-disposition'];
            const fileName = contentDisposition
                ? decodeURIComponent(contentDisposition.split('filename=')[1]).trim().replace(/"/g, '')
                : 'report.docx'; // Varsayılan dosya adı
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }

    };

    return (
        <Container className="report-container">
            <Row className="justify-content-center" style={{ position: 'relative' }}>
                {error && <ErrorAlert 
                            show={true} 
                            onClose={() => setError(null)}
                            message={error}
                        />}
            </Row>
            <Form onSubmit={createReport}>
                <h1 className="text-center mb-4">Rapor Oluştur</h1>
                <Row>
                    {/* Day Input */}
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Toplantı Günü</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                            >
                                <option value="">Toplantı Günü</option>
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
                            <Form.Label>Toplantı Ayı</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">Toplantı Ayı</option>
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
                            <Form.Label>Toplantı Yılı</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="">Toplantı Yılı</option>
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
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Okul Dönemi</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                <option value="">Okul Dönemi</option>
                                {Array.from({ length: 4 }, (_, i) => i + 1).map((semester) => (
                                    <option key={semester} value={semester}>
                                        {semesterEnum[semester]}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={4} sm={12} className="mb-3">
                        <Form.Group>
                            <Form.Label>Okul Yılı</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedTerm}
                                onChange={(e) => setTerm(e.target.value)}
                            >
                                <option value="">Okul Yılı</option>
                                {allTerms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.name}
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