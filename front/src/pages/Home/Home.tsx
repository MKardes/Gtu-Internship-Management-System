import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"
import "./Home.css";
import Logo from "../../assets/logo.jpg";
import ErrorAlert from "../../components/ErrorAlert/ErrorAlert";
import { useNavbar } from "../../components/Navbar/NavbarContext";
import Input from "../../components/Input/Input";

const Home: React.FC = () => {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fetchUserData } = useNavbar();
  const navigate = useNavigate();

  useEffect(() => {
  const checkToken = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken || refreshToken) {
      try {
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (response.status === 200) {
          navigate("/dashboard");
        }

      } catch (error) {
        console.error("Token geçersiz veya süresi dolmuş:", error);
        // Burada herhangi bir /refresh-token işlemi yapmıyoruz, çünkü interceptor hallediyor
      }
    }
  };
  checkToken();
}, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        mail: inputUsername,
        password: inputPassword,
      });

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      fetchUserData();
      navigate("/dashboard");
    } catch (error) {
      console.error("Hata:", error);
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in__wrapper">
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <img
          className="img-thumbnail mx-auto d-block mb-2"
          src={Logo}
          alt="logo"
        />
        <div className="h4 mb-2 text-center">GTU Staj Takip Sistemi</div>
        {/* ErrorAlert component'i */}
        <ErrorAlert
          show={show}
          onClose={() => setShow(false)}
          message="Kullanıcı adı veya şifre hatalı!"
        />
        <Form.Group className="mb-2" controlId="username">
          <Form.Label className="d-flex justify-content-between text-left">Email</Form.Label>
          <Form.Control
            type="email"
            value={inputUsername}
            placeholder="Email"
            onChange={(e) => setInputUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="password">
          <Form.Label className="d-flex justify-content-between text-left">Şifre</Form.Label>
          <Form.Control 
            type="password"
            value={inputPassword}
            placeholder="Şifre"
            onChange={(e) => setInputPassword(e.target.value)}
          />
        </Form.Group>
        {!loading ? (
          <Button className="w-100" variant="primary" type="submit">
            Giriş Yap
          </Button>
        ) : (
          <Button className="w-100" variant="primary" type="submit" disabled>
            Yükleniyor...
          </Button>
        )}
        <div className="d-grid justify-content-end">
          <Button className="text-muted px-0" variant="link">
            <Link to="/forgot-password">Parolamı Unuttum</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Home;
