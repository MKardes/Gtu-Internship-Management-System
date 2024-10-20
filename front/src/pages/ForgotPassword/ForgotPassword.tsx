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
        // Başarılı ise, kullanıcıyı kod doğrulama sayfasına yönlendir
        navigate('/confirm-code');
    } catch (err) {
      // Hata durumunda hata mesajını göster
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
        <h2>Şifremi Unuttum</h2>
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
