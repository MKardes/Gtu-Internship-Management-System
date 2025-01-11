import React, { useState } from 'react';
import { Button, Card, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

const NewPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setShowError(true);
      return;
    }

    const handleError = (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.message);
      } else {
          setError('Bilinmeyen bir hata oluştu');
      }
    };

    try {
      const mail = localStorage.getItem('mail');
      const response = await axios.post('/api/auth/change-password', { password, mail });

      setShowError(false);

      if (response.status === 200) {
        localStorage.removeItem('mail');
        navigate('/login');
      }
    } catch (err) {
      handleError(err)
      setShowError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetPassword();
  };

  const handleCloseError = () => {
    setShowError(false);
    setError('');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="p-4">
            <Card.Body>
              <h4 className="text-center mb-3">Yeni Şifre Belirle</h4>
              {showError && (
                <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Yeni Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Şifreyi Doğrula"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  Şifreyi Sıfırla
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewPassword;
