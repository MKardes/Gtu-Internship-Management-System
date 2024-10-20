import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewPassword.css';
import Input from '../../components/Input/Input';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import axios from 'axios';

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

    try {
      // Backend entegrasyonu ile şifre sıfırlama işlemi yapılabilir.
      // const response = await axios.post('/api/reset-password', { password });

      // Başarılı ise, kullanıcıyı giriş sayfasına yönlendir.
      navigate('/login');
    } catch (err) {
      setError('Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.');
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
    <div className="new-password-container">
      <div className="new-password-card">
        <h2>Yeni Şifre Belirle</h2>
        {showError && (
          <ErrorAlert show={showError} onClose={handleCloseError} message={error} />
        )}
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Yeni Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Şifreyi Doğrula"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="reset-password-button">Şifreyi Sıfırla</button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
