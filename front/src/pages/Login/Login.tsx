import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        mail: email,
        password: password,
      });
      const { accessToken } = response.data;
      localStorage.setItem("token", accessToken);
      navigate("/dashboard"); // Başarılı giriş sonrası yönlendirme
    } catch (error) {
      console.error("Giriş başarısız:", error);
      // Hata yönetimini burada gerçekleştirin
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin(email, password);
      }}
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Giriş Yap</button>
    </form>
  );
};

export default Login;
