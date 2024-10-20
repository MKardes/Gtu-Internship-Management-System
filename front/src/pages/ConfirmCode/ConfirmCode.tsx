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
  const navigate = useNavigate();

  const handleVerifyCode = async () => {
    try {
        navigate('/new-password');
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

  const handleCloseError = () => {
    setShowError(false);
    setError('');
  };

  return (
    <div className="confirm-code-container">
      <div className="confirm-code-card">
        <h2>Kod Doğrulama</h2>
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
      </div>
    </div>
  );
};

export default ConfirmCode;
