import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfirmCode.css';
import Input from '../../components/Input/Input';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import axios from 'axios';

const ConfirmCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const handleVerifyCode = async () => {
    try {
      const mail = localStorage.getItem('mail');
      const response = await axios.post('/api/auth/verify-code', { mail, code });
      
      if (response.status === 200) {
        navigate('/new-password');
      }
    } catch (err) {
      // Hata durumunda hata mesajını göster
      setError('Kod doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
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
    } catch (err) {
      setError('Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    setError('');
  };

  return (
    <div className="confirm-code-container">
      <div className="confirm-code-card">
        <div className="h4 mb-2 text-center">Kod Doğrulama</div>
        <p>Lütfen e-posta adresinize gönderilen doğrulama kodunu girin.</p>
        {showError && (
          <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
        )}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Doğrulama Kodu"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="verify-code-button">Kodu Doğrula</button>
        </form>
        <p className="resend-code-link" onClick={handleResendCode}>Yeni Kod Gönder</p>
        {resendMessage && <p className="resend-message">{resendMessage}</p>}
      </div>
    </div>
  );
};

export default ConfirmCode;
