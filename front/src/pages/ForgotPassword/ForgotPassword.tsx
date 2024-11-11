import React, { useState } from 'react';
import './ForgotPassword.css';
import Input from '../../components/Input/Input';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      // Call the API to send the verification code to the email
      const response = await axios.post('/api/auth/send-code', { email });
      localStorage.setItem('mail', email);
      // If successful, navigate to the code confirmation page
      if (response.status === 200) {
        navigate('/confirm-code');
      }
    } catch (err) {
      // Handle error, show error message to user
      setError('Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="h4 mb-2 text-center">Şifremi Unuttum</div>
        {showError && (
          <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
        )}
        <p>Lütfen kayıtlı e-posta adresinizi girin. Size şifre sıfırlama kodu göndereceğiz.</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="E-posta Adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="send-code-button">Kodu Gönder</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
