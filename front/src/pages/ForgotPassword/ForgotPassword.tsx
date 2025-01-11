import React, { useState } from 'react';
import { Button, Card, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  
  const handleError = (error: any) => {
    if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
    } else {
        setError('Bilinmeyen bir hata oluştu');
    }
  };

  const handleSendCode = async () => {
    try {
      // API'yi çağırıp e-posta adresine kod göndermek
      const response = await axios.post('/api/auth/send-code', { email });
      localStorage.setItem('mail', email);
      // Başarılı olursa kod doğrulama sayfasına yönlendirme
      if (response.status === 200) {
        navigate('/confirm-code');
      }
    } catch (err) {
      // Hata durumunu işleme
      handleError(err);
      setShowError(true);
    }
  }; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendCode();
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
              <h4 className="text-center">Şifremi Unuttum</h4>
              <Row className='mb-4'>
                {showError && (
                  <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
                )}
              </Row>
              <p className="text-center mb-4">
                Lütfen kayıtlı e-posta adresinizi girin. Size şifre sıfırlama kodu göndereceğiz.
              </p>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="E-posta Adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  Kodu Gönder
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
