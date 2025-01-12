import React, { useState } from 'react';
import { Button, Card, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

const ConfirmCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const handleError = (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data.message);
      } else {
          setError('Bilinmeyen bir hata oluştu');
      }
  };

  const handleVerifyCode = async () => {
    try {
      const mail = localStorage.getItem('mail');
      const response = await axios.post('/api/auth/verify-code', { mail, code });

      if (response.status === 200) {
        navigate('/new-password');
      }
      setShowError(false);
    } catch (err) {
      handleError(err);
      setShowError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode();
  };

  const handleResendCode = async () => {
    try {
      const email = localStorage.getItem('mail');
      await axios.post('/api/auth/send-code', { email });
      setResendMessage('Yeni kod e-posta adresinize gönderildi.');
      setTimeout(() => setResendMessage(''), 5000); // Mesajı 5 saniye sonra temizle
      setShowError(false);

    } catch (err) {
      handleError(err);
      setShowError(true);
    }
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
              <h4 className="text-center mb-3">Kod Doğrulama</h4>
              <p className="text-center">
                Lütfen e-posta adresinize gönderilen doğrulama kodunu girin.
              </p>
              {showError && (
                <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
              )}
              {resendMessage && <Alert variant="success" className="text-center">{resendMessage}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Doğrulama Kodu"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  Kodu Doğrula
                </Button>
              </Form>
              <p className="text-center mt-3" onClick={handleResendCode} style={{ cursor: 'pointer', color: '#007bff' }}>
                Yeni Kod Gönder
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmCode;
